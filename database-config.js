// Import fungsi yang dibutuhkan dan dipakai
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getStorage, uploadBytes, getDownloadURL, ref as storageRef, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { getDatabase, set, get, update, remove, push, ref as databaseRef, child, onValue, orderByChild } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
   apiKey: "AIzaSyDHnaq4hR0LfwYYu2hVM5EW4lOx0HlyLOI",
   authDomain: "cloud-akmal.firebaseapp.com",
   databaseURL: "https://cloud-akmal-default-rtdb.asia-southeast1.firebasedatabase.app",
   projectId: "cloud-akmal",
   storageBucket: "cloud-akmal.appspot.com",
   messagingSenderId: "184887073788",
   appId: "1:184887073788:web:a8691d99143ca7922bf079",
   measurementId: "G-9HCSDX7PRR"
};


// Menginisialisasi Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Menginisialisasi Authentication
const auth = getAuth(app);

// Menginisialisasi Storage
const storage = getStorage(app);

// Menginisialisasi Database
const db = getDatabase();

// PROSES MEMBUAT AKUN (SIGN UP)
document.addEventListener("DOMContentLoaded", () => {
   // Menginisialisasi variabel untuk menarik data dari inputan
   const adminEmailForSignUp = document.querySelector("#admin-create-email");
   const adminPasswordForSignUp = document.querySelector("#admin-create-password");

   // Variabel untuk tombol signup
   const signUpBtn = document.querySelector("#signup-account-btn");

   // Membuat fungsi signup
   const userSignUp = async () => {
      // Mengambil nilai dari inputan dan memasukkannya ke variabel baru
      const signUpEmail = adminEmailForSignUp.value;
      const signUpPassword = adminPasswordForSignUp.value;

      try {
         const userCredential = await createUserWithEmailAndPassword(auth, signUpEmail, signUpPassword);
         const user = userCredential.user;
         alert("Account successfully created");
         window.location.reload();  // Refresh halaman setelah akun berhasil dibuat
      } catch (error) {
         const errorCode = error.code;
         const errorMessage = error.message;
         console.log(errorCode + errorMessage);
         alert("Error creating account: " + errorMessage);  // Menampilkan pesan error yang lebih informatif
      }
   };

   // Menjalankan fungsi userSignUp ketika tombol create account ditekan
   signUpBtn.addEventListener("click", (event) => {
      event.preventDefault(); // Mencegah halaman untuk reload atau action default lainnya
      userSignUp();
   });
});


// PROSES MASUK AKUN (LOGIN)
document.addEventListener("DOMContentLoaded", () => {
   // Menginisialisasi variabel untuk menarik data dari inputan
   const adminEmailForLogin = document.querySelector("#admin-login-email");
   const adminPasswordForLogin = document.querySelector("#admin-login-password");

   // Variabel untuk tombol login
   const loginBtn = document.querySelector("#login-account-btn");

   // Membuat fungsi sign in
   const userSignIn = async () => {
      // Mengambil nilai dari inputan dan memasukkannya ke variabel baru
      const loginEmail = adminEmailForLogin.value;
      const loginPassword = adminPasswordForLogin.value;

      try {
         const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
         const user = userCredential.user;
         alert("Account successfully logged in");
         window.location.href = "/pages/admin-home.html";
      } catch (error) {
         const errorCode = error.code;
         const errorMessage = error.message;
         console.log(errorCode + errorMessage);
         alert("Error logging in: " + errorMessage);
      }
   }

   // Menjalankan fungsi userSignIn ketika tombol login ditekan
   loginBtn.addEventListener("click", (event) => {
      event.preventDefault(); // Mencegah halaman untuk reload atau action default lainnya
      userSignIn();
   });
});

// PROSES MEMBUAT ARTIKEL
document.addEventListener("DOMContentLoaded", () => {
   // Mendapatkan elemen input
   const articleTitleInput = document.querySelector("#article-title");
   const articleCategoryInput = document.querySelector("#article-category");
   const articleContentInput = document.querySelector("#content-article");
   const articleImageInput = document.querySelector("#file_input");

   // Tombol submit
   const createArticleBtn = document.querySelector("#create-article-btn");

   // Inisialisasi fungsi untuk membuat artikel
   const createArticle = async () => {
      // Mendapatkan file gambar yang diunggah
      const imageFile = articleImageInput.files[0];
      ``
      // Jika input tidak terisi maka tampilkan pesan error 
      if (!imageFile || !articleTitleInput.value || !articleCategoryInput.value || !articleContentInput.value) {
         alert("Please fill out all fields");
         return;
      }

      // Upload gambar ke Firebase Storage
      const storageReference = storageRef(storage, `Images/${imageFile.name}`);
      await uploadBytes(storageReference, imageFile);

      // Mendapatkan URL gambar yang diunggah
      const imageURL = await getDownloadURL(storageReference);

      // Menyimpan data artikel ke Firebase Realtime Database
      await set(push(databaseRef(db, "Articles")), {
         ArticleTitle: articleTitleInput.value,
         ArticleCategory: articleCategoryInput.value,
         ArticleContent: articleContentInput.value,
         ArticleImage: imageURL, // Menyimpan URL gambar
         CreatedAt: new Date().toISOString()
      })
         .then(() => {
            // Menampilkan pesan sukses
            alert("Article created successfully!");
            window.location.reload();
         })
         .catch((error) => {
            // Menampilkan pesan error
            alert("Error creating article: " + error);
         });
   };

   // Menjalankan fungsi createRecipe ketika tombol create recipe ditekan
   createArticleBtn.addEventListener("click", (event) => {
      event.preventDefault(); // Mencegah halaman untuk reload atau action default lainnya
      createArticle();
   });
});

// PROSES MENAMPILKAN ARTIKEL DI HALAMAN HOME
document.addEventListener("DOMContentLoaded", () => {
   // Mendapatkan referensi tabel yang diinginkan dari database
   const articleRef = databaseRef(db, "Articles");

   // Mendapatkan elemen HTML yang akan dimanipulasi
   const displayArticleContainer = document.querySelector("#display-article");

   // Mendapatkan data artikel untuk ditampilkan di halaman home
   onValue(articleRef, (snapshot) => {
      // Mendapatkan data article
      const data = snapshot.val();

      // Menghapus konten yang ada (untuk mencegah duplikasi)
      displayArticleContainer.innerHTML = "";

      const maxWords = 22; // Jumlah kata maksimum yang diinginkan

      // Function to get the first few words
      function getFirstWords(text, maxWords) {
         // Split teks menjadi kata-kata
         const words = text.split(/\s+/);

         // Ambil bagian pertama dari array kata-kata sesuai dengan jumlah maksimum kata
         const truncatedWords = words.slice(0, maxWords);

         // Gabungkan kembali menjadi kalimat
         return truncatedWords.join(' ');
      }

      // Melakukan iterasi setiap entri di dalam data 
      for (const uid in data) {
         const articleData = data[uid];

         const articleCard = document.createElement("div");
         articleCard.className = `itemBox ${articleData.ArticleCategory.toLowerCase()}`;

         // Memotong konten artikel menjadi beberapa kalimat pertama
         const truncatedContent = getFirstWords(articleData.ArticleContent, maxWords);

         // Menampilkan elemen HTML
         articleCard.innerHTML = `
       <a href="admin-article.html?uid=${uid}" class="hover:border-b hover:border-red-500 flex flex-col gap-2 py-2">
               <img
                  src="${articleData.ArticleImage}"
                  alt="" class="rounded-md object-cover w-full h-56">
               <h1 class="text-lg font-bold tracking-tight pt-2">${articleData.ArticleTitle}</h1>
               <div class="flex flex-row justify-between">
                  <p class="text-sm text-gray-600 italic">${articleData.ArticleCategory}</p>
                  <p class="text-sm text-gray-600 italic">${new Date(articleData.CreatedAt).toLocaleDateString()}</p>
               </div>
               <p class="text-sm py-2 text-gray-700">${truncatedContent}...</p>
            </a>
           `;

         // Menambahkan elemen HTML ke dalam div parents
         displayArticleContainer.appendChild(articleCard);
      }
   }, (errorObject) => {
      console.log("Error getting data: " + errorObject.code);
   });
});

// PROSES MENAMPILKAN ARTIKEL DI HALAMAN ARTIKEL DETAIL
document.addEventListener("DOMContentLoaded", () => {

   // Membuat fungsi untuk mendapatkan query dari URL
   function getQueryParam(param) {
      // Menyimpan URL saat ini ke dalam variabel
      const urlParams = new URLSearchParams(window.location.search);

      // Memberikan value dari function getQueryParam menjadi URL yang sedang dibuka
      return urlParams.get(param);
   }

   // Menapatkan referensi UID Artikel yang sedang dibuka dari URL
   const uid = getQueryParam("uid");

   // Pengkondisian untuk menampilkan artikel yang sedang dibuka berdasarkan UID nya
   if (uid) {
      // Mendapatkan referensi artikel berdasarkan UID di dalam tabel Articles
      const articleRef = databaseRef(db, `Articles/${uid}`);

      // Fungsi bawaan Firebase untuk mendapatkan data
      get(articleRef).then((snapshot) => {
         // Pengkondisian untuk menampilkan artikel jika UID yang diinginkan ada di tabel
         if (snapshot.exists()) {
            const articleData = snapshot.val();

            document.getElementById("article-image").src = articleData.ArticleImage;
            document.getElementById("article-title").innerText = articleData.ArticleTitle;
            document.getElementById("article-category").innerText = articleData.ArticleCategory;
            document.getElementById("article-content").innerText = articleData.ArticleContent;
            document.getElementById("article-created-at").innerText = new Date(articleData.CreatedAt).toLocaleDateString();

            // Mendapatkan elemen Edit This Article di navbar
            const editArticleLink = document.querySelector("#edit-article");

            // Merubah href dari tag di navbar menjadi URL yang diinginkan
            if (editArticleLink) {
               editArticleLink.href = `admin-edit-article.html?uid=${uid}`;
            }
         } else {
            console.log("No data available for this article");
         }
      }).catch((error) => {
         console.log("Error getting data: " + error);
      });
   } else {
      console.log("No UID available for this article");
   }
});

// PROSES MENAMPILKAN DATA ARTIKEL SAAT INI UNTUK DIGANTI DI HALAMAN EDIT ARTIKEL
document.addEventListener("DOMContentLoaded", () => {
   // Membuat fungsi untuk mendapatkan query dari URL
   function getQueryParam(param) {
      // Menyimpan URL saat ini ke dalam variabel
      const urlParams = new URLSearchParams(window.location.search);

      // Memberikan value dari function getQueryParam menjadi URL yang sedang dibuka
      return urlParams.get(param);
   }

   // Mendapatkan UID dari URL
   const uid = getQueryParam("uid");

   // Membuat variabel untuk mendapatkan bagian input dari HTML
   const displayCurrentThumbnailImage = document.querySelector("#display-thumbnail-image");
   const articleUIDInput = document.querySelector("#article-uid");
   const articleTitleInput = document.querySelector("#article-title-input");
   const articleCategoryInput = document.querySelector("#category-article-input");
   const articleContentInput = document.querySelector("#content-article-input");

   // Variabel untuk mendapatkan bagian input gambar artikel
   const articleImageInput = document.querySelector("#file_input_edit");

   // Membuat variabel untuk mendapatkan tombol update artikel dan tombol delete artikel
   const updateArticleButton = document.querySelector("#edit-article-btn");
   const deleteArticleButton = document.querySelector("#delete-article-btn");

   // Pengkondisian untuk menampilkan artikel yang sedang dibuka berdasarkan UID nya
   if (uid) {
      // Mendapatkan referensi artikel berdasarkan UID di dalam tabel Articles
      const articleRef = databaseRef(db, `Articles/${uid}`);

      // Fungsi bawaan Firebase untuk mendapatkan data
      get(articleRef).then((snapshot) => {
         // Pengkondisian untuk menampilkan artikel jika UID yang diinginkan ada di tabel
         if (snapshot.exists()) {
            // Mengambil data artikel dari database
            const articleData = snapshot.val();

            displayCurrentThumbnailImage.src = articleData.ArticleImage;

            articleUIDInput.value = uid;
            articleTitleInput.value = articleData.ArticleTitle;
            articleCategoryInput.value = articleData.ArticleCategory;
            simplemde.value(articleData.ArticleContent);
         } else {
            console.log("No data available");
         }
      }).catch((error) => {
         console.log("Error getting data: ", error);
      });
   } else {
      console.log("No UID provided");
   }

   function updateArticle() {
      // Mendapatkan file gambar yang diunggah, jika ada
      const imageFile = articleImageInput.files[0];

      // Membuat referensi ke data artikel di Firebase
      const articleRef = databaseRef(db, `Articles/${articleUIDInput.value}`);

      // Fungsi untuk mengupdate data di database
      function updateRecipeData(imageURL) {
         update(articleRef, {
            ArticleTitle: articleTitleInput.value,
            ArticleCategory: articleCategoryInput.value,
            ArticleContent: articleContentInput.value,
            ArticleImage: imageURL || displayCurrentThumbnailImage.src
         }).then(() => {
            alert("Article updated successfully!");
            window.location.reload();
         }).catch((error) => {
            console.error("Error updating article: ", error);
         });
      }

      // Jika ada gambar baru, unggah ke Firebase Storage
      if (imageFile) {
         const storageImageRef = storageRef(storage, `Images/${imageFile.name}`);
         uploadBytes(storageImageRef, imageFile).then(() => {
            return getDownloadURL(storageImageRef);
         }).then((imageURL) => {
            updateRecipeData(imageURL);
         }).catch((error) => {
            console.error("Error uploading image: ", error);
         });
      } else {
         // Jika tidak ada gambar baru, langsung perbarui data
         updateRecipeData();
      }
   }

   // Menambahkan event listener ke tombol update
   updateArticleButton.addEventListener("click", (event) => {
      event.preventDefault();
      updateArticle();
   });

   // Fungsi untuk menghapus artikel
   function deleteArticle() {
      // Ambil referensi ke data artikel yang akan dihapus
      const articleRef = databaseRef(db, "Articles/" + articleUIDInput.value);

      // Ambil data artikel terlebih dahulu untuk mendapatkan URL gambar
      get(articleRef).then((snapshot) => {
         if (snapshot.exists()) {
            const articleData = snapshot.val();
            const imageURL = articleData.ArticleImage;

            // Hapus data artikel dari database
            remove(articleRef).then(() => {
               alert("Article deleted successfully!");

               // Jika gambar ada, hapus dari Firebase Storage
               if (imageURL) {
                  // Ekstrak nama file dari URL gambar
                  const imageName = decodeURIComponent(imageURL.split('/o/')[1].split('?')[0]);

                  // Referensi ke gambar di Firebase Storage
                  const storageImageRef = storageRef(storage, imageName);

                  // Hapus gambar dari Firebase Storage
                  deleteObject(storageImageRef).then(() => {
                     console.log("Image deleted successfully from storage.");
                  }).catch((error) => {
                     console.error("Error deleting image from storage: ", error);
                  });
               }

               window.location.href = "admin-home.html";
            }).catch((error) => {
               console.error("Error deleting article: ", error);
               alert("Failed to delete article. Please try again.");
            });
         } else {
            console.log("No data available for the given UID.");
            alert("Article not found. Please check the UID.");
         }
      }).catch((error) => {
         console.error("Error retrieving article: ", error);
      });
   }

   // Tambahkan event listener ke tombol delete
   deleteArticleButton.addEventListener("click", (event) => {
      event.preventDefault();
      const confirmDelete = confirm("Are you sure you want to delete this article? This process can't be undone.");
      if (confirmDelete) {
         deleteArticle();
      }
   });
})

// FUNGSI FORGOT PASSWORD
document.addEventListener("DOMContentLoaded", () => {
   const emailInput = document.querySelector("#admin-login-email");
   const forgotPasswordButton = document.querySelector("#sendPasswordResetEmail");

   function forgotPassword() {
      sendPasswordResetEmail(auth, emailInput.value)
         .then(() => {
            alert(`Password reset email sent successfully! to ${emailInput.value}`);
         })
         .catch((error) => {
            alert("Failed to send password reset email. Please input the correct email address.");
         });
   }

   forgotPasswordButton.addEventListener("click", (event) => {
      event.preventDefault();
      forgotPassword();
   });

});