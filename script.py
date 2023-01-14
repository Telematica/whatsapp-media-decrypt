import sys
import json
import io

try:
    file, jsonFile = sys.argv
except:
    print("No file!")
    exit()

def loadFile(file: str) -> io.TextIOWrapper:
    f = open(file) # Opening JSON file
    return f

def closeFile(file: io.TextIOWrapper):
    file.close()

async def downloadFile(url: str) -> None:
    return None

if __name__ == '__main__':
    jsonFileObj = loadFile(jsonFile)
    data = json.load(jsonFileObj) # returns JSON object as a dictionary
    files = list(map(lambda x : {}, data))
    print(files)

