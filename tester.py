import os
import cloudinary
import cloudinary.uploader
import cloudinary.api
import json

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

    product_data = []

    for root, _, files in os.walk(folder_path):
        for file in files:
            file_path = os.path.join(root, file)
            try:
                print(f"Uploading: {file_path}")
                response = cloudinary.uploader.upload(file_path)
                image_url = response['secure_url']
                
                product = {
                    "productName": file.split('.')[0],  # Assumes file name as product name
                    "productImages": [image_url],
                    "productAllNames": [file.split('.')[0]],  # Assumes file name as product name
                    "price": 19.0,  # Example static price, change if needed
                    "size": ["Small", "Medium", "Large"],  # Example static sizes, change if needed
                    "stocks": 50,  # Example static stock, change if needed
                    "description": f"A fully customizable {file.split('.')[0]}.",  # Example description
                    "status": "Available",  # Example static status
                    "isCustomizable": False,  # Example static customization status
                    "createdAt": "2024-12-16T00:00:00Z",  # Example static date, replace with current date if needed
                    "updatedAt": "2024-12-16T00:00:00Z",  # Example static date, replace with current date if needed
                }
                
                product_data.append(product)

                print(f"Uploaded {file} : {image_url}\n")
            except Exception as e:
                print(f"Failed to upload {file} : {e}\n")
    
    seeder_data = {
        "up": {
            "queryInterface": {
                "bulkInsert": {
                    "Products": product_data,
                    "{}": {}
                }
            }
        },
        "down": {
            "queryInterface": {
                "bulkDelete": {
                    "Products": None,
                    "{}": {}
                }
            }
        }
    }

    # Save to a file (optional)
    with open("seeder_data.json", "w") as outfile:
        json.dump(seeder_data, outfile, indent=4)

    return seeder_data


folder_to_upload = "jersey/"
upload_files_in_folder(folder_to_upload)
