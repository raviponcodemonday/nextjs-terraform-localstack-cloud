"use client";
import { useState, useEffect } from "react";

interface S3File {
  name: string;
  size: number;
  lastModified: string;
}

export default function Home() {
  const [files, setFiles] = useState<S3File[]>([]);
  const [status, setStatus] = useState("");

  // ฟังก์ชันดึงรายชื่อไฟล์จาก S3
  const fetchFiles = async () => {
    const res = await fetch("/api/s3-test");
    const data = await res.json();
    if (data.success) {
      setFiles(data.files);
    } else {
      setStatus("Error: " + data.error);
    }
  };

  // ฟังก์ชันสั่งสร้างไฟล์ขึ้น S3
  const uploadTestFile = async () => {
    setStatus("กำลังอัปโหลดขึ้น S3...");
    const res = await fetch("/api/s3-test", { method: "POST" });
    const data = await res.json();
    if (data.success) {
      setStatus(data.message);
      fetchFiles(); // อัปโหลดเสร็จให้ดึงรายการใหม่ทันที
    } else {
      setStatus("ล้มเหลว: " + data.error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <main style={{ padding: "40px", fontFamily: "sans-serif", maxWidth: "600px" }}>
      <h1>Next.js + Docker + LocalStack S3</h1>
      <p>ทดสอบส่งไฟล์จาก Container ไปเก็บใน S3 Bucket ที่สร้างด้วย Terraform</p>

      <button
        onClick={uploadTestFile}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        + สร้างและอัปโหลดไฟล์ขึ้น S3
      </button>

      {status && <p style={{ color: "green", marginTop: "15px" }}>{status}</p>}

      <h3 style={{ marginTop: "30px" }}>รายการไฟล์ใน S3 (my-dream-cloud-storage):</h3>
      {files.length === 0 ? (
        <p style={{ color: "#666" }}>ยังไม่มีไฟล์ใน Bucket</p>
      ) : (
        <ul>
          {files.map((file) => (
            <li key={file.name} style={{ marginBottom: "8px" }}>
              <strong>{file.name}</strong> ({file.size} bytes)
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}