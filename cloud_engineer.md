# ☁️ สรุปโปรเจกต์ End-to-End Cloud Infrastructure & CI/CD

เอกสารฉบับนี้รวบรวมองค์ความรู้ ขั้นตอนการทำงาน และแนวทางการตอบคำถามสัมภาษณ์งานจากการสร้างโปรเจกต์จำลองระบบ Cloud แบบครบวงจรด้วย Next.js, Docker, Terraform, LocalStack และ GitHub Actions

---

## 🎯 1. ภาพรวมของโปรเจกต์ (Project Overview)
**เป้าหมาย:** สร้างระบบ Cloud Infrastructure และ Web Application ที่สามารถทำงานร่วมกันได้บนเครื่อง Local โดยจำลองพฤติกรรมของ AWS จริง และมีระบบ CI/CD อัตโนมัติ

**Tech Stack ที่ใช้:**
* **Frontend/App:** Next.js (App Router), AWS SDK v3
* **Containerization:** Docker (Multi-stage build), Docker Compose
* **Infrastructure as Code (IaC):** Terraform
* **Cloud Emulator:** LocalStack (จำลอง AWS S3, VPC)
* **CI/CD:** GitHub Actions

---

## 🛠️ 2. สรุป Task และการแก้ปัญหาที่เกิดขึ้น (Tasks & Debugging)

### Task 2.1: แก้ปัญหา Next.js เชื่อมต่อ LocalStack ไม่ได้
* **ปัญหา:** `connect ECONNREFUSED 192.168.65.254:4566`
* **สาเหตุ:** ตัวแอปพยายามวิ่งเข้าพอร์ตที่ปิดอยู่ หรือติดล็อก `127.0.0.1` ใน `docker-compose.yml`
* **วิธีแก้:** เอา `127.0.0.1:` ออกจาก `ports:` ในไฟล์ compose เพื่อให้รับ Connection จากภายนอกกล่องได้
* **ปัญหาต่อเนื่อง:** `The specified bucket does not exist` (หา S3 ไม่เจอ)
* **วิธีแก้:** รัน `terraform apply -auto-approve` ใหม่อีกครั้ง เพราะ LocalStack จะรีเซ็ตข้อมูลตัวเองทุกครั้งที่ปิด-เปิดใหม่

### Task 2.2: รวมระบบด้วย Docker Compose
* **สิ่งที่ทำ:** ย้าย Next.js และ LocalStack มาไว้ใน `docker-compose.yml` เดียวกัน
* **ข้อดี:** ทำให้ทั้ง 2 กล่องอยู่ใน Network วงเดียวกัน (เรียกชื่อ `localstack` แทน IP ได้เลย) และสั่งเปิดทั้งระบบได้ด้วยคำสั่งเดียว `docker compose up -d --build`
* **ข้อควรระวัง:** หากมีการแก้โค้ด Next.js ต้องใส่ `--build` เสมอ เพื่อบังคับให้ Docker สร้าง Image ใหม่ทับตัวเก่า

### Task 2.3: สร้างระบบ CI/CD ด้วย GitHub Actions
* **สิ่งที่ทำ:** สร้างไฟล์ `.github/workflows/ci.yml` เพื่อให้หุ่นยนต์ตรวจสอบโค้ด Terraform (`fmt`, `validate`) และทดสอบ Build Docker Image อัตโนมัติทุกครั้งที่ Push โค้ด
* **การแก้ปัญหา Git Submodule:** โฟลเดอร์ `my-nextjs-app` ไม่ถูกส่งขึ้น GitHub เพราะแอบมีไฟล์ `.git` ซ่อนอยู่ แก้โดยการลบ `.git` ตัวในทิ้ง (`rm -rf my-nextjs-app/.git`) แล้วสั่ง `git rm --cached` ก่อน commit ใหม่

---

## 🧠 3. สรุปความเข้าใจเครื่องมือหลัก (Core Concepts)

1. **`docker-compose.yml`:** เครื่องมือจัดการสภาพแวดล้อมจำลอง ใช้เปิดบริการหลายๆ ตัว (เช่น แอปของเรา + LocalStack) ให้ทำงานร่วมกันในวง Network ส่วนตัว
2. **`Terraform`:** เครื่องมือ IaC (Infrastructure as Code) ใช้เขียนโค้ดสั่งสร้างโครงสร้างพื้นฐานบน Cloud (VPC, S3) แทนการกดผ่านหน้าเว็บ
3. **`Dockerfile`:** สมุดจดสูตรอาหารสำหรับแพ็กแอปไปเป็น **Image** (แม่พิมพ์) ซึ่งเมื่อสั่งรันจะได้ออกมาเป็น **Container** (ตัวแอปที่กำลังทำงาน)

---

## 🎤 4. คัมภีร์ซ้อมสัมภาษณ์งาน Cloud Engineer (Mock Interview Q&A)

### ข้อ 1: อะไรคือตัวตัดสินว่า Subnet เป็น Public หรือ Private?
* **Concept:** ไม่ใช่ชื่อที่ตั้ง แต่คือ **Route Table** และการแจก Public IP
* **คำตอบระดับโปร:** "ตัวตัดสินคือ Route Table ครับ ถ้า Route Table นั้นมีเส้นทาง `0.0.0.0/0` ชี้ออกไปที่ Internet Gateway (IGW) และ Subnet นั้นเปิดรับ Public IP มันคือ Public Subnet ทราฟฟิกภายนอกจึงเข้ามาได้ ส่วน Private Subnet ไม่มีทางออกไป IGW คนภายนอกจึงมองไม่เห็นครับ"

### ข้อ 2: ทำไมต้องทำ Multi-Stage Docker Build และใช้ Standalone?
* **Concept:** แยกสภาพแวดล้อมตอน Build (ที่ต้องใช้ Tools เยอะ) ออกจากตอน Run (ใช้แค่ไฟล์ที่จำเป็น)
* **คำตอบระดับโปร:** "เพื่อแยก Build-time ออกจาก Run-time ครับ เราจะทิ้ง Source code ดั้งเดิมและ `node_modules` ขนาดใหญ่ไว้ข้างหลัง แล้วหยิบมาเฉพาะไฟล์ที่แปลงเป็น Standalone แล้ว ประโยชน์คือ 1) ลดขนาด Image ได้หลายเท่าตัว Deploy เร็วขึ้น และ 2) เพิ่มความปลอดภัย (ลด Attack Surface) เพราะไม่มี Tools ส่วนเกินให้แฮกเกอร์แอบใช้งานครับ"

### ข้อ 3: การทำ CI/CD (GitHub Actions) ช่วยแก้ปัญหาอะไร?
* **Concept:** Automated Quality Gate และป้องกันปัญหา "รันผ่านแค่ในเครื่องฉัน"
* **คำตอบระดับโปร:** "ทำหน้าที่เป็นด่านตรวจคุณภาพ (Quality Gate) อัตโนมัติครับ แม้ในเครื่องเราจะรันผ่าน แต่เครื่องเราอาจมี Cache หรือ Config ส่วนตัว การให้ GitHub เปิดเครื่อง `ubuntu-latest` เปล่าๆ ขึ้นมาเทส จะพิสูจน์ว่าโค้ดทำงานได้จริงในทุกสภาพแวดล้อม และช่วยบังคับมาตรฐานโค้ด (เช่น `terraform fmt`) ให้เหมือนกันทั้งทีมก่อนที่จะกด Merge โค้ดครับ"

### ข้อ 4: ถ้าจะเอาโปรเจกต์นี้ขึ้น AWS ของจริง ต้องปรับปรุงความปลอดภัยจุดไหนบ้าง?
* **Concept:** เลิกใช้ Key ใน `.env` และต้องจัดการ Terraform State
* **คำตอบระดับโปร:** "มี 2 จุดใหญ่ครับ 1) เรื่อง Credentials ผมจะเลิกใช้ Access Key ใน `.env` แต่จะเปลี่ยนไปใช้ **IAM Role** ผูกกับ Container แทน เพื่อให้แอปคุยกับ S3 ได้แบบ Keyless และ 2) เรื่อง Terraform State ผมจะย้ายไฟล์ `terraform.tfstate` จากเครื่อง Local ไปเก็บไว้บน **S3 (Remote Backend)** พร้อมเปิด **DynamoDB State Locking** เพื่อให้ทีมทำงานร่วมกันได้โดยไม่รันโค้ดชนกันครับ"

---

## 💼 5. Bullet Points สำหรับ Resume / LinkedIn (XYZ Formula)

* **Infrastructure as Code (IaC):** Architected and provisioned a secure AWS networking environment (VPC, Public/Private Subnets, IGW, Route Tables) and S3 storage using **Terraform** via **LocalStack** to achieve zero-cost local cloud simulation.
* **Container Optimization:** Engineered a highly optimized **Multi-Stage Dockerfile** for a Next.js application leveraging `standalone` output, significantly reducing the final container image size and minimizing the security attack surface.
* **Continuous Integration (CI):** Implemented an automated CI pipeline using **GitHub Actions** with parallel jobs to enforce `terraform fmt/validate` and verify Docker image builds on every pull request, ensuring production-ready code quality.
* **Service Orchestration:** Orchestrated a multi-container local development environment using **Docker Compose**, establishing isolated networking and decoupling configurations following the 12-Factor App methodology.

---

## 🌐 6. การทดสอบและจำลอง Network (Network Testing)

* **การพิสูจน์ Network บน AWS จริง:**
  * ยิงคำสั่ง `nc -zv <Public_IP> 80` จากคอมพิวเตอร์ที่บ้าน -> **ต้องสำเร็จ (succeeded)**
  * ยิงคำสั่ง `nc -zv <Private_IP> 80` จากคอมพิวเตอร์ที่บ้าน -> **ต้องถูกบล็อก (Operation timed out)**
* **เครื่องมือวิเคราะห์ (ไม่ต้องเปิดเครื่องจริง):** ใช้ **AWS VPC Reachability Analyzer**
* **ข้อควรจำ:** `Route Table` เปรียบเสมือนป้ายบอกทาง (ถนน) ส่วน `Security Group` เปรียบเสมือนยามเฝ้าประตู (Firewall ตรวจพอร์ตและ IP)