# ส่วนที่ 1: ตั้งค่าให้ Terraform วิ่งไปหาสนามซ้อม LocalStack ในเครื่องเรา (ไม่ไป Amazon จริง)
provider "aws" {
  region                      = "ap-southeast-1"
  access_key                  = "test" # ใส่รหัสผ่านปลอม
  secret_key                  = "test" # ใส่รหัสผ่านปลอม
  s3_use_path_style           = true
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true

  endpoints {
    s3  = "http://localhost:4566" # ชี้เป้าไปที่ประตู 4566 ของ LocalStack
    ec2 = "http://localhost:4566"
  }
}

# ส่วนที่ 2: พิมพ์เขียวสั่งสร้าง "กล่องเก็บไฟล์" (S3 Bucket)
resource "aws_s3_bucket" "my_first_storage" {
  bucket = "my-dream-cloud-storage" # ตั้งชื่อกล่องเก็บไฟล์ของเรา
}