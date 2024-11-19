# debug_server.py
from fastapi import FastAPI, WebSocket
import serial
import asyncio
import json

app = FastAPI()

def find_pico_port():
    target_port = '/dev/tty.usbserial-A104VDBO'
    try:
        ser = serial.Serial(port=target_port, baudrate=115200, timeout=1)
        print(f"Successfully connected to {target_port}")
        return ser
    except Exception as e:
        print(f"Error connecting to {target_port}: {e}")
        return None

pico = find_pico_port()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("\n=== WebSocket Connected ===")
    
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
            
            if command["action"] == "move_conveyor":
                print("\n=== Starting Movement Sequence ===")
                pico.write(b'move\n')
            elif command["action"] == "home":
                print("\n=== Returning to Home Position ===")
                pico.write(b'home\n')
            
            # Wait for response
            while True:
                if pico.in_waiting:
                    response = pico.readline().decode().strip()
                    print(f"\n=== Pico Response: {response} ===")
                    
                    await websocket.send_text(json.dumps({
                        "status": response,
                        "position": int(response.split('_')[1]) 
                        if response.startswith(('moving_', 'reached_')) 
                        else None
                    }))
                    
                    if response in ['sequence_complete', 'home_reached', 'already_home', 'error']:
                        break
                        
                await asyncio.sleep(0.1)
                    
    except Exception as e:
        print(f"\n=== WebSocket Error ===\n{e}\n===================")

if __name__ == "__main__":
    import uvicorn
    print("\n=== Starting Server ===")
    uvicorn.run(app, host="0.0.0.0", port=8001)