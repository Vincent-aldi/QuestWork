#!/usr/bin/env bash
# Unduh gambar hero dari Figma. URL Figma kedaluwarsa 7 hari — jika gagal,
# buka frame "Login & Masuk Petualangan" lalu export layer "Image" (6:17) sebagai PNG ke assets/login/hero.png
set -e
mkdir -p assets/login
curl -L -o assets/login/hero.png \
  "https://www.figma.com/api/mcp/asset/40835e9f-436d-4996-8feb-56ee891ed01d/684ef.png"
echo "OK: assets/login/hero.png"
