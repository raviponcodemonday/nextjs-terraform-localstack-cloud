# 1. สร้างรั้วหมู่บ้าน (VPC) กำหนดขนาดพื้นที่ IP (10.0.0.0/16 มี IP ใช้ได้ 65,536 เบอร์)
resource "aws_vpc" "my_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true

  tags = {
    Name = "my-first-vpc"
  }
}

# 2. สร้างประตูทางออกสู่ถนนใหญ่ (Internet Gateway) แล้วนำไปติดไว้ที่รั้วหมู่บ้าน
resource "aws_internet_gateway" "my_igw" {
  vpc_id = aws_vpc.my_vpc.id # เชื่อมเข้ากับ VPC ที่สร้างด้านบน

  tags = {
    Name = "my-vpc-igw"
  }
}

# 3. แบ่งโซนหน้าร้าน (Public Subnet) - 10.0.1.0/24 (มี 256 เบอร์)
resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.my_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "ap-southeast-1a"
  map_public_ip_on_launch = true # บอกว่าของที่มาวางในโซนนี้ จะได้รับเบอร์ IP สาธารณะ

  tags = {
    Name = "my-public-subnet"
  }
}

# 4. แบ่งโซนห้องนิรภัย (Private Subnet) - 10.0.2.0/24 (มี 256 เบอร์)
resource "aws_subnet" "private_subnet" {
  vpc_id            = aws_vpc.my_vpc.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "ap-southeast-1a"

  tags = {
    Name = "my-private-subnet"
  }
}

# 5. สร้างป้ายบอกทาง (Route Table) สำหรับโซนหน้าร้าน ให้วิ่งออกประตูใหญ่ (IGW) ได้
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.my_vpc.id

  route {
    cidr_block = "0.0.0.0/0" # 0.0.0.0/0 หมายถึง "อินเทอร์เน็ตภายนอกทั้งหมด"
    gateway_id = aws_internet_gateway.my_igw.id
  }

  tags = {
    Name = "my-public-route-table"
  }
}

# 6. นำป้ายบอกทางไปปักไว้ที่ Public Subnet (ส่วน Private Subnet ไม่ต้องปัก จะได้ออกเน็ตไม่ได้)
resource "aws_route_table_association" "public_assoc" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.public_rt.id
}

# 7. สั่งให้ Terraform ปริ้นท์รหัส ID ของสิ่งที่สร้างเสร็จออกมาโชว์บนหน้าจอ
output "created_vpc_id" {
  value = aws_vpc.my_vpc.id
}

output "created_public_subnet_id" {
  value = aws_subnet.public_subnet.id
}

output "created_private_subnet_id" {
  value = aws_subnet.private_subnet.id
}