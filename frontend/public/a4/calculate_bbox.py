   
def is_float(value):
        try:
            float(value)
            return True
        except ValueError:
            return False
        
def is_float_with_dot(value: str) -> bool:
        try:
            float(value)
            return '.' in value
        except ValueError:
            return False
        
def calculate_half(input_path):
    print(input_path)
    arr = []
    temp = []
    flag = False
    for l in open(input_path,'r'):
        # print(l)
        if flag:
            temp.append(l)
        if 'ENDMDL' in l:
            flag = False
            arr.append(temp)
            temp = []
        if 'MODEL' in l:
            flag = True 

    arr_x = []
    arr_y = []
    arr_z = []
    # print(len(arr))
    # print(arr[0][0].split())
        
    arr_else = []
    for a in arr:
        for l in a:
            temp = 0
            for c in l.split():
                if is_float_with_dot(c):
                    temp = temp + 1 
                    if temp == 1:
                        arr_x.append(float(c))
                    elif temp == 2:
                        arr_y.append(float(c))
                    elif temp == 3:
                        arr_z.append(float(c))
                    else:
                        arr_else.append(float(c))
    # print(len(arr_x),len(arr_y),len(arr_z),len(arr_else))
    # print('X',max(arr_x),min(arr_x))
    # print('Y',max(arr_y),min(arr_y))
    # print('Z',max(arr_z),min(arr_z))

    halfX = (max(arr_x)-min(arr_x))/2
    halfY = (max(arr_y)-min(arr_y))/2
    halfZ = (max(arr_z)-min(arr_z))/2
    halfX = halfX+min(arr_x)
    halfY = halfY+min(arr_y)
    halfZ = halfZ+min(arr_z)         
    return halfX, halfY, halfZ 

x, y, z = calculate_half('single_C8C10C12/C8_multiframe.pdb')
print(x,y,z)

# TO DO 
# calculate bbox 
# calculate data for figure A