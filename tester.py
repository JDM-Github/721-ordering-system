import os
import cloudinary
import cloudinary.uploader
import cloudinary.api

cloudinary.config(
    cloud_name="djheiqm47",
	api_key="692765673474153",
	api_secret="kT7k8hvxo-bqMWL0aHB2o3k90dA", 
)

def upload_files_in_folder(folder_path):
    if not os.path.exists(folder_path):
        print(f"Folder '{folder_path}' does not exist.")
        return

    print(f"Uploading files from folder: {folder_path}\n")
    
    for root, _, files in os.walk(folder_path):
        for file in files:
            file_path = os.path.join(root, file)
            try:
                print(f"Uploading: {file_path}")
                response = cloudinary.uploader.upload(file_path)
                print(f"Uploaded {file} : {response['secure_url']}\n")
            except Exception as e:
                print(f"Failed to upload {file} : {e}\n")

folder_to_upload = "images/"
upload_files_in_folder(folder_to_upload)
