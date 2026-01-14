input_path = 'C12_multiframe.pdb'
flag = False 
f = 1 
for i in open(input_path,'r').readlines():
    if flag:
        file_o.write(i)
    if 'ENDMDL' in i:
        flag = False
        file_o.close()
        f += 1
    if 'MODEL' in i:
        flag = True
        file_o =  open(f'C12_frame_{f}.pdb','w')
    
        