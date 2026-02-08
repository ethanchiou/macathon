
import os
import sys

# Mimic videos.py logic
current_file = os.path.abspath("app/routes/videos.py")
print(f"Fake __file__: {current_file}")

output_dir_videos_py = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(current_file))), "output")
print(f"videos.py output_dir: {output_dir_videos_py}")

# Mimic VideoAssembler logic
params_cwd = os.getcwd()
output_dir_assembler = os.path.join(params_cwd, "output")
print(f"assembler output_dir: {output_dir_assembler}")

print(f"Match? {os.path.abspath(output_dir_videos_py) == os.path.abspath(output_dir_assembler)}")

if os.path.exists(output_dir_videos_py):
    print("Listing videos.py output content:")
    print(os.listdir(output_dir_videos_py))
else:
    print("videos.py output dir does not exist")

if os.path.exists(output_dir_assembler):
    print("Listing assembler output content:")
    print(os.listdir(output_dir_assembler))
else:
    print("assembler output dir does not exist")
