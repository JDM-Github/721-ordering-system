import os
import cloudinary
import cloudinary.uploader
import json
from datetime import datetime

cloudinary.config(
    cloud_name="djheiqm47",
    api_key="692765673474153",
    api_secret="kT7k8hvxo-bqMWL0aHB2o3k90dA"
)

IMAGE_FOLDER = "jersey"
MAX_NAME_LENGTH = 20
PRODUCT_LIST = []

def format_name(filename):
    """Generate a clean name with max 20 characters (excluding extension)."""
    name = os.path.splitext(filename)[0]
    return name[:MAX_NAME_LENGTH]

def generate_product(name, url):
    now_iso = datetime.utcnow().isoformat() + "Z"
    return {
        "productName": name,
        "productImages": [url],
        "productAllNames": [name],
        "price": 19.0,
        "size": ["Small", "Medium", "Large"],
        "stockPerSize": [10, 20, 30],
        "stocks": 60,
        "description": f"A fully customizable {name}.",
        "status": "Available",
        "isCustomizable": False,
        "createdAt": now_iso,
        "updatedAt": now_iso
    }

def main():
    for filename in os.listdir(IMAGE_FOLDER):
        filepath = os.path.join(IMAGE_FOLDER, filename)
        if os.path.isfile(filepath):
            name = format_name(filename)
            print(f"Uploading {filename} as {name}...")

            try:
                upload_result = cloudinary.uploader.upload(
                    filepath,
                    folder="images",
                    public_id=name,
                    overwrite=True,
                    use_filename=False,
                    unique_filename=False
                )

                url = upload_result["secure_url"]
                product = generate_product(name, url)
                PRODUCT_LIST.append(product)

            except Exception as e:
                print(f"Failed to upload {filename}: {e}")

    with open("products.json", "w") as f:
        json.dump(PRODUCT_LIST, f, indent=4)
    print("Done! Products saved to products.json")

if __name__ == "__main__":
    main()
