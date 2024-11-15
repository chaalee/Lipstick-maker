# backend/server.py
from fastapi import FastAPI, WebSocket
import serial.tools.list_ports
from serial import Serial, SerialException
import asyncio
import json

app = FastAPI()

def find_pico_port():
    """Try different possible ports to find the Pico"""
    try:
        # List all available ports
        ports = serial.tools.list_ports.comports()
        
        for port in ports:
            # Look for Pico's vendor ID
            if "2E8A" in port.hwid.upper():  # Raspberry Pi Pico vendor ID
                try:
                    pico = Serial(port.device, 115200, timeout=1)
                    print(f"Connected to Pico on {port.device}")
                    return pico
                except SerialException as e:
                    print(f"Error connecting to {port.device}: {e}")
                    continue

        # If Pico not found, try common port names
        possible_ports = [
            '/dev/ttyACM0',  # Linux
            '/dev/ttyACM1',
            'COM3',          # Windows
            'COM4',
            '/dev/tty.Bluetooth-Incoming-Port'  # Mac
        ]
        
        for port in possible_ports:
            try:
                pico = Serial(port, 115200, timeout=1)
                print(f"Connected to Pico on {port}")
                return pico
            except (SerialException, OSError):
                continue
                
        print("No Pico device found")
        return None
        
    except Exception as e:
        print(f"Error searching for Pico: {e}")
        return None

# Try to connect to Pico
pico = find_pico_port()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    global pico
    if not pico:
        pico = find_pico_port()
    
    while True:
        try:
            data = await websocket.receive_text()
            command = json.loads(data)
            
            if command["action"] == "move_conveyor":
                if pico:
                    try:
                        # Send command to Pico
                        pico.write(b'move\n')
                        pico.flush()
                        
                        # Wait for responses with timeout
                        while True:
                            if pico.in_waiting:
                                response = pico.readline().decode().strip()
                                if response:
                                    print(f"Received from Pico: {response}")
                                    
                                    # Send response to frontend
                                    await websocket.send_text(json.dumps({
                                        "status": response,
                                        "position": int(response.split('_')[1]) - 1 
                                        if response.startswith('moving_') else None
                                    }))
                                    
                                    # Check if sequence is complete
                                    if response == 'sequence_complete':
                                        break
                                        
                            await asyncio.sleep(0.1)
                            
                    except Exception as e:
                        print(f"Serial error: {e}")
                        pico = find_pico_port()
                        await websocket.send_text(json.dumps({
                            "status": "error", 
                            "message": "Lost connection to Pico"
                        }))
                else:
                    await websocket.send_text(json.dumps({
                        "status": "error", 
                        "message": "Pico not connected"
                    }))
                    
        except Exception as e:
            print(f"Error in websocket: {e}")
            break

# Add startup and shutdown events
@app.on_event("startup")
async def startup_event():
    global pico
    if not pico:
        pico = find_pico_port()

@app.on_event("shutdown")
async def shutdown_event():
    global pico
    if pico:
        pico.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)