import csv
import json
import sys

def main():
    if(len(sys.argv) < 2 or len(sys.argv) > 4):
        exit(1)
    csvFile = sys.argv[1]
    jsonFile = sys.argv[2]
    data = {}
    with open(csvFile) as c:
        csvReader = csv.DictReader(c)
        for rows in csvReader:
            id = rows['id']
            data[id] = rows
    with open(jsonFile, 'w') as j:
        j.write(json.dumps(data, indent=4)) 
        # fieldNames= csvFile.readline().split(',')
        # print(fieldNames)
        # data = {}
        # reader = csv.DictReader( csvFile, fieldNames)
        # for row in reader:
        #     json.dump(row, jsonFile)
        #     jsonFile.write('\n')

    #print(jsonFile)

if __name__ == "__main__":
    main()