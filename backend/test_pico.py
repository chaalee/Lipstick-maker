# backend/test_pico.py
import serial
import serial.tools.list_ports
import time

def list_all_ports():
    print("\nListing all available ports:")
    ports = serial.tools.list_ports.comports()
    for port in ports:
        print(f"Port: {port.device}")
        print(f"Description: {port.description}")
        print(f"Hardware ID: {port.hwid}")
        print("-" * 50)

def test_pico_connection():
    print("\nSearching for Pico...")
    
    # First, try to find Pico by vendor ID
    ports = serial.tools.list_ports.comports()
    for port in ports:
        if "2E8A" in port.hwid.upper():  # Raspberry Pi Pico vendor ID
            print(f"Found Pico at {port.device}")
            try:
                pico = serial.Serial(port.device, 115200, timeout=1)
                print("Successfully connected to Pico!")
                pico.close()
                return port.device
            except Exception as e:
                print(f"Error connecting to Pico: {e}")
    
    print("No Pico found by vendor ID, trying common port names...")
    
    # Try common port names
    possible_ports = [
        '/dev/ttyACM0',  # Linux
        '/dev/ttyACM1',
        'COM3',          # Windows
        'COM4',
        '/dev/tty.Bluetooth-Incoming-Port'  # Mac
    ]
    
    for port in possible_ports:
        try:
            print(f"Trying {port}...")
            pico = serial.Serial(port, 115200, timeout=1)
            print(f"Successfully connected to {port}")
            pico.close()
            return port
        except:
            continue
    
    print("Could not find Pico on any port!")
    return None

if __name__ == "__main__":
    print("Testing Pico Connection")
    print("=" * 50)
    
    # List all available ports
    list_all_ports()
    
    # Test Pico connection
    pico_port = test_pico_connection()
    
    if pico_port:
        print(f"\nUse this port in server.py: {pico_port}")
    else:
        print("\nPlease check if:")
        print("1. Pico is connected to your computer")
        print("2. main.py is uploaded to Pico")
        print("3. You have necessary permissions to access the port")