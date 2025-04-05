# 🗺️ OOP ile Harita Tabanlı Uygulama

Bu proje, JavaScript'te öğrendiğim nesne yönelimli programlama (OOP) prensiplerini uygulamak amacıyla geliştirilmiştir. Projede ES6 ile gelen class yapısı kullanılmış ve encapsulation (veri saklama) ile inheritance (kalıtım) gibi temel kavramlar ele alınmıştır.

## 🚀 Kullanılan Teknolojiler

- **JavaScript (ES6+)**
- **Leaflet.js** (Harita işlemleri için)
- **Geolocation API** (Kullanıcının konumunu almak için)
- **localStorage** (Verileri tarayıcıda saklamak için)

## 🔧 Uygulama Özellikleri

- Kullanıcının konumu Geolocation API ile alınır ve harita üzerinde gösterilir.
- Haritada bir noktaya tıklanınca, yan taraftaki gizli form görünür hale gelir.
- Form aracılığıyla girilen verilerle haritada yeni bir marker oluşturulur.
- Marker oluşturulduktan sonra form tekrar gizlenir.
- Oluşturulan veriler hem haritada görüntülenir hem de yanda listelenir.
- Veriler tarayıcıya `localStorage` ile kaydedilir ve sayfa yenilense dahi korunur.
- Oluşturulan kayıtlar daha sonra düzenlenebilir.

## 🎯 Amaç

- OOP yapılarını (class, inheritance, encapsulation) pekiştirmek
- Gerçek dünya senaryolarında JavaScript’i uygulamalı olarak kullanmak
- Leaflet.js gibi üçüncü parti kütüphaneleri projeye entegre etmeyi öğrenmek
- localStorage gibi tarayıcı özelliklerini kullanarak veri yönetimi yapmak

