# backend/server.py
from fastapi import FastAPI, WebSocket
import serial
import serial.tools.list_ports
import asyncio
import json

app = FastAPI()

def find_pico_port():
    """Find Pico's port"""
    # Specifically look for the USB-Serial port
    target_port = '/dev/tty.usbserial-A104VDBO'  # Serial connection port
    
    try:
        ser = serial.Serial(
            port=target_port,
            baudrate=115200,
            bytesize=serial.EIGHTBITS,
            parity=serial.PARITY_NONE,
            stopbits=serial.STOPBITS_ONE,
            timeout=1
        )
        print(f"Connected to Pico on {target_port}")
        return ser
    except Exception as e:
        print(f"Error connecting to {target_port}: {e}")
        return None

# Initialize Pico connection
pico = find_pico_port()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("WebSocket connected")
    
    if not pico:
        await websocket.send_text(json.dumps({
            "status": "error",
            "message": "Pico not connected"
        }))
        return
    
    try:
        while True:
            data = await websocket.receive_text()
            command = json.loads(data)
            print(f"Received command: {command}")
            
            if command["action"] == "move_conveyor":
                # Send command to Pico
                pico.write(b'move\n')
                print("Command sent to Pico")
                
                # Wait for response with timeout
                start_time = asyncio.get_event_loop().time()
                while True:
                    if pico.in_waiting > 0:
                        response = pico.readline().decode().strip()
                        print(f"Pico response: {response}")
                        await websocket.send_text(json.dumps({
                            "status": response
                        }))
                        break
                    
                    # Check for timeout after 5 seconds
                    if asyncio.get_event_loop().time() - start_time > 5:
                        print("Response timeout")
                        await websocket.send_text(json.dumps({
                            "status": "error",
                            "message": "Response timeout"
                        }))
                        break
                    
                    await asyncio.sleep(0.1)
                
    except Exception as e:
        print(f"WebSocket error: {e}")
        if pico:
            pico.close()

@app.on_event("shutdown")
async def shutdown_event():
    if pico:
        pico.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)