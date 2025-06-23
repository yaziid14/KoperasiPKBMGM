// Page Login
function sign_in() {
    let username = $('#inputUsername').val();
    let password = $('#inputPassword').val();

    $.ajax({
        type: "POST",
        url: "/sign_in",
        data: {
            username_give: username,
            password_give: password,
        },
        success: function (response) {
            console.log(response)
            if (response["result"] === "success") {
                $.removeCookie('mytoken', { path: '/' });
                $.removeCookie('role', { path: '/' });
                if (response["role"] === "admin") {
                    $.cookie("mytoken", response["token"], { path: "/" });
                    $.cookie("role", response["role"], { path: "/" });
                    $.cookie("username", response["username"], { path: "/" });
                    window.location.replace("/adminpage");
                }
                if (response["role"] === "user") {
                    $.cookie("mytoken", response["token"], { path: "/" });
                    $.cookie("role", response["role"], { path: "/" });
                    $.cookie("username", response["username"], { path: "/" });
                    window.location.replace("/userpage");
                }
                else {
                    $.cookie("mytoken", response["token"], { path: "/" });
                    $.cookie("role", response["role"], { path: "/" });
                    $.cookie("username", response["username"], { path: "/" });
                    window.location.replace("/")
                }
            } else {
                Swal.fire({
                    toast: true,
                    position: 'top-start',
                    icon: 'error',
                    title: response["msg"],
                    showConfirmButton: false,
                    timer: 1000,
                    timerProgressBar: true
                });
            }
        },
    });
}

function role_log() {
    let role = $.cookie('role');
    if (role === "admin") {
        window.location.replace("/adminpage")
    } else if (role === "user") {
        window.location.replace("/userpage")
    }
}

function check_role() {
    let role = $.cookie('role');
    if (role === "admin") {
        window.location.replace("/adminpage");
    } else if (role === "user") {
        window.location.replace("/userpage");
    } else {
        window.location.replace("/");
    }
}


function check_admin() {
    let role = $.cookie('role');
    if (role !== "admin") {
        Swal.fire({
            icon: 'error',             // Bisa: 'success', 'error', 'warning', 'info', 'question'
            title: 'Gagal!',
            text: 'Kamu bukan Admin',
            confirmButtonColor: '#625f5f',
            confirmButtonText: 'OK'
        });
        window.location.replace("/")
    }
}

function check_user() {
    let role = $.cookie('role');
    if (role !== "user") {
        Swal.fire({
            icon: 'error',             // Bisa: 'success', 'error', 'warning', 'info', 'question'
            title: 'Error',
            text: 'Kamu bukan User',
            confirmButtonColor: '#625f5f',
            confirmButtonText: 'OK'
        });
        window.location.replace("/")
    }
}

function no_login() {
    let role = $.cookie('role');
    if (role === undefined) {
        Swal.fire({
            icon: 'error',             // Bisa: 'success', 'error', 'warning', 'info', 'question'
            title: 'Gagal',
            text: 'Kamu harus login terlebih dahulu..',
            confirmButtonColor: '#625f5f',
            confirmButtonText: 'OK'
        });
        window.location.replace("/")
    }
}

function check_id() {
    let username = $("#inputUsername").val();
    if (!username) {
        return Swal.fire({
            toast: true,
            position: 'top-start',
            icon: 'warning',
            title: 'Silahkan input username',
            showConfirmButton: false,
            timer: 1000,
            timerProgressBar: true
        });
    }

    let helpUS = $("#inputUsername");
    let helpId = $("#helpId"); // pastikan ini adalah elemen <i> ikon
    $.ajax({
        type: "POST",
        url: "/check_id",
        data: {
            username_give: username,
        },
        success: function (response) {
            if (response["exists"]) {
                Swal.fire({
                    toast: true,
                    position: 'top-start',
                    icon: 'warning',
                    title: 'Username sudah digunakan',
                    showConfirmButton: false,
                    timer: 1000,
                    timerProgressBar: true
                });
                helpId
                    .removeClass("fa-solid fa-user")
                    .removeClass("fa-solid fa-check")
                    .addClass("fa-solid fa-xmark"); // ganti dari fa-times ke fa-xmark (di FA 6.5)
            } else {
                Swal.fire({
                    toast: true,
                    position: 'top-start',
                    icon: 'success',
                    title: 'Username bisa digunakan',
                    showConfirmButton: false,
                    timer: 1000,
                    timerProgressBar: true
                });
                helpId
                    .removeClass("fa-solid fa-user")
                    .removeClass("fa-solid fa-xmark")
                    .addClass("fa-solid fa-check");
                helpUS.attr("disabled", true);
            }
        },
    });
}


function sign_out() {
    const logoutModal = new bootstrap.Modal(document.getElementById('logoutModal'));
    logoutModal.show();
}

function confirm_logout() {
    $.removeCookie('mytoken', { path: '/' });
    $.removeCookie('role', { path: '/' });
    $.removeCookie("username", { path: "/" });
    window.location.href = "/";
}

function favorite(para) {
    let judul = para;
    let username = $.cookie("username");
    let fav_id = $(`#fav-${judul}`);

    if (fav_id.hasClass("fas")) {
        // Jika sudah favorit (solid), ubah ke outline
        fav_id.removeClass("fas").addClass("far");

        $.ajax({
            type: 'POST',
            url: '/fav',
            data: {
                judul_give: judul,
                username_give: username,
                action_give: "delete"
            },
            success: function (response) {
                if (response.result === 'success') {
                    Swal.fire({
                        toast: true,
                        position: 'top-start',
                        icon: 'info',
                        title: 'Terhapus dari favorite',
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true
                    }).then(() => {
                        // Jika user sedang di halaman /favorite, reload list favorit
                        if (window.location.pathname === "/favorite") {
                            showfav();
                        }
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: 'Ada yang salah',
                        confirmButtonColor: '#625f5f',
                        confirmButtonText: 'OK'
                    });
                }
            }
        });
    } else {
        // Jika belum favorit (outline), ubah ke solid
        fav_id.removeClass("far").addClass("fas");

        $.ajax({
            type: 'POST',
            url: '/fav',
            data: {
                judul_give: judul,
                username_give: username,
                action_give: "favorited"
            },
            success: function (response) {
                if (response.result === 'success') {
                    Swal.fire({
                        toast: true,
                        position: 'top-start',
                        icon: 'success',
                        title: 'Ditambahkan ke favorite',
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal!',
                        text: 'Ada yang salah',
                        confirmButtonColor: '#625f5f',
                        confirmButtonText: 'OK'
                    });
                }
            }
        });
    }
}

function keranjang(para) {
    let judul = para;
    let username = $.cookie("username");
    let cart_id = $(`#cart-${judul}`);

    if (cart_id.hasClass("fa-cart-arrow-down")) {
        // Hapus dari keranjang
        cart_id.removeClass("fas fa-cart-arrow-down").addClass("fas fa-cart-plus");

        $.ajax({
            type: 'POST',
            url: '/addcart',
            data: {
                judul_give: judul,
                username_give: username,
                action_give: "delete"
            },
            success: function (response) {
                if (response.result === 'success') {
                    Swal.fire({
                        toast: true,
                        position: 'top-start',
                        icon: 'info',
                        title: 'Terhapus dari keranjang',
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal!',
                        text: 'Ada yang salah',
                        confirmButtonColor: '#625f5f',
                        confirmButtonText: 'OK'
                    });
                }
            }
        });

    } else {
        // Tambahkan ke keranjang
        cart_id.removeClass("fas fa-cart-plus").addClass("fas fa-cart-arrow-down");

        $.ajax({
            type: 'POST',
            url: '/addcart',
            data: {
                judul_give: judul,
                username_give: username,
                action_give: "Added to cart"
            },
            success: function (response) {
                if (response.result === 'success') {
                    Swal.fire({
                        toast: true,
                        position: 'top-start',
                        icon: 'success',
                        title: 'Ditambahkan ke keranjang',
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal!',
                        text: 'Ada yang salah',
                        confirmButtonColor: '#625f5f',
                        confirmButtonText: 'OK'
                    });
                }
            }
        });
    }
}


function cari() {
    let kata = $("#cari").val()
    if (!kata) {
        return Swal.fire({
            toast: true,
            position: 'top-start',
            icon: 'warning',
            title: 'Kata masih kosong',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });
    }
    let url = kata.replaceAll(/[^0-9a-zA-Z -]/g, '').toLowerCase();
    let url1 = url.replaceAll(' ', '-');
    window.location.href = `/search/${url}`
}

function deleteadm(para) {
    let judul = $(para).text();
    if (confirm(`Apakah anda ingin menghapus '${judul}'?`)) {
        $.ajax({
            type: 'POST',
            url: '/deletebook',
            data: {
                judul_give: judul
            },
            success: function (response) {
                if (response.result === 'success') {
                    Swal.fire({
                        toast: true,
                        position: 'top-start',
                        icon: 'success',
                        title: response["msg"],
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true
                    });
                    tampil_admin();
                } else {
                    Swal.fire({
                        toast: true,
                        position: 'top-start',
                        icon: 'error',
                        title: 'Ada yang salah',
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true
                    });
                }
            }
        });
    }
    return false;
}

// Page Admin
function tampil_admin() {
    $.ajax({
        type: 'GET',
        url: '/dbadmin',
        data: {},
        success: function (response) {
            let rows = response['daftarbuku'];
            let rows1 = response['daftaruser'];
            let rows2 = response['daftarorder'];

            let count = rows2.length;
            let count1 = rows1.length;

            let dashboard = `
                <div class="box box-bg1 my-2 mx-2">
                    <div class="info">
                        <h3 class="semibold">Pengguna</h3>
                        <p class="count regular">
                            <b style="color: #004ad880;">${count1}</b>
                            <a onclick="lihatUser()" data-bs-toggle="modal" data-bs-target="#userModal">Pengguna</a>
                        </p>
                    </div>
                    <i class="fa fa-user"></i>
                </div>
                <div class="box box-bg2 my-2 mx-2">
                    <div class="info">
                        <h3 class="semibold">Transaksi</h3>
                        <p class="count regular"><b style="color: #d8410080;">${count}</b> <a onclick="lihatOrder()">Orders</a></p>
                    </div>
                    <i class="fa fa-shopping-cart"></i>
                </div>`;
            $('#dashboard').append(dashboard);

            for (let i = 0; i < rows.length; i++) {
                let judul = rows[i]['JudulBuku'];
                let harga = rows[i]['Harga'];
                let stok = rows[i]['Stok'];
                let url = rows[i]['URL'];
                let coverList = rows[i]['AllCover']; // array of image paths

                let carouselId = `carousel-${i}`;

                // Carousel Items
                let carouselItems = '';
                for (let j = 0; j < coverList.length; j++) {
                    carouselItems += `
                    <div class="carousel-item ${j === 0 ? 'active' : ''}">
                        <img src="/static/${coverList[j]}" class="d-block w-100 card-book-img1" alt="cover-${j}">
                    </div>`;
                }

                let carouselHTML = '';

                if (coverList.length > 1) {
                    // Show full carousel with controls
                    carouselHTML = `
                    <div id="${carouselId}" class="carousel slide" data-bs-ride="carousel">
                        <div class="carousel-inner">
                            ${carouselItems}
                        </div>
                        <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Previous</span>
                        </button>
                        <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Next</span>
                        </button>
                    </div>`;
                } else {
                    // Only show single image, no carousel needed
                    carouselHTML = `
                    <div>
                        <img src="/static/${coverList[0]}" class="d-block w-100 card-book-img1" alt="cover-0">
                    </div>`;
                }

                let temp_html = `
                <div class="col">
                    <div class="card card-book">
                        <a href="/detail/${url}">${carouselHTML}</a>
                        <div class="card-body mt-3">
                            <h5 id="${url}" class="fw-semibold text-center text-truncate d-flex align-items-center justify-content-center"
                                style="min-height: 3rem; font-size: clamp(0.9rem, 1.2vw, 1.2rem); line-height: 1.2;">
                            ${judul}
                            </h5>
                            <h6>Stok : ${stok}</h6>
                            <h5 class="regular harga">Rp.${harga.toLocaleString('id-ID')}</h5>
                        </div>
                        <div class="d-flex justify-content-between">
                            <a href="/edit/${url}" class="btn semibold card-admin-btn" style="background-color: #0A868C;">Edit</a>
                            <button onclick="deleteadm('#${url}')" class="btn semibold card-admin-btn ms-3" style="background-color: #D60000;" id="delete">Delete</button>
                        </div>
                    </div>
                </div>`;
                $('#card-book').append(temp_html);
            }

        }
    });
}

function lihatOrder() {
    window.location.href = '/orderadmin';
}

// Page user
function tampil_user() {
    $.ajax({
        type: 'GET',
        url: '/barang',
        data: {},
        success: function (response) {
            let rows = response['daftarbuku'];
            $('#card-book').empty(); // kosongkan sebelum append ulang

            for (let i = 0; i < rows.length; i++) {
                let judul = rows[i]['JudulBuku'];
                let deskripsi = rows[i]['Deskripsi'];
                let harga = rows[i]['Harga'];
                let kategori = rows[i]['Kategori'];
                let stok = parseInt(rows[i]['Stok']);
                let coverList = rows[i]['AllCover']; // array cover
                let url = rows[i]['URL'];

                // Tentukan status tombol keranjang
                let cart_btn_html = '';
                if (stok > 0) {
                    cart_btn_html = `<a onclick="keranjang('${url}')">
                                        <i class="fas fa-cart-plus fa-2x" id="cart-${url}"></i>
                                     </a>`;
                } else {
                    cart_btn_html = `<a>
                                        <i class="fas fa-cart-plus fa-2x text-muted" id="cart-${url}" title="Stok habis" style="pointer-events: none; opacity: 0.5;"></i>
                                     </a>`;
                }

                // Carousel logic
                let carouselId = `carousel-${i}`;
                let carouselHTML = '';

                if (coverList.length > 1) {
                    let carouselItems = '';
                    for (let j = 0; j < coverList.length; j++) {
                        carouselItems += `
                        <div class="carousel-item ${j === 0 ? 'active' : ''}">
                            <img src="/static/${coverList[j]}" class="d-block w-100 card-book-img1" alt="cover-${j}">
                        </div>`;
                    }

                    carouselHTML = `
                    <div id="${carouselId}" class="carousel slide" data-bs-ride="carousel">
                        <div class="carousel-inner">
                            ${carouselItems}
                        </div>
                        <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Previous</span>
                        </button>
                        <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Next</span>
                        </button>
                    </div>`;
                } else {
                    carouselHTML = `
                    <div>
                        <img src="/static/${coverList[0]}" class="d-block w-100 card-book-img1" alt="cover-0">
                    </div>`;
                }

                let temp_html = `
                    <div class="col">
                        <div class="card card-book">
                            <a href="/detail/${url}">
                                ${carouselHTML}
                            </a>
                            <div class="card-body">
                                <h5 class="fw-semibold text-center text-truncate d-flex align-items-center justify-content-center"
                                    style="min-height: 3rem; font-size: clamp(0.9rem, 1.2vw, 1.2rem); line-height: 1.2;">
                                ${judul}
                                </h5>
                                <h6>Stok : ${stok}</h6>
                                <h5 class="regular py-2 harga">Rp.${harga.toLocaleString('id-ID')}</h5>
                            </div>
                            <div class="d-flex justify-content-between px-2 pb-3" id="book-btn">
                                <a onclick="favorite('${url}')">
                                    <i class="far fa-heart fa-2x" id="fav-${url}"></i>
                                </a>
                                <a href="/detail/${url}" class="btn semibold card-body-btn">Detail</a>
                                ${cart_btn_html}
                            </div>
                        </div>
                    </div>`;

                $('#card-book').append(temp_html);
            }

            // Update icon favorite
            let fav_rows = response['daftarfavorite'];
            for (let i = 0; i < fav_rows.length; i++) {
                let favurl = fav_rows[i]["JudulBuku"];
                let fav_id = $(`#fav-${favurl}`);
                fav_id.removeClass("far fa-heart").addClass("fas fa-heart");
            }

            // Update icon keranjang (jika masih stok)
            let cart_rows = response['daftarkeranjang'];
            for (let i = 0; i < cart_rows.length; i++) {
                let carturl = cart_rows[i]["JudulBuku"];
                let cart_id = $(`#cart-${carturl}`);
                if (cart_id.length && !cart_id.hasClass("text-muted")) {
                    cart_id.removeClass("fa-cart-plus").addClass("fa-cart-arrow-down");
                }
            }
        }
    });
}




// Page Cart
function showcart() {
    $.ajax({
        type: 'GET',
        url: '/showcart',
        data: {},
        success: function (response) {
            let rows = response['daftarbuku'];
            let role = $.cookie('role');
            let all_html = '';
            let checkout_button = '';

            for (let i = 0; i < rows.length; i++) {
                let judul = rows[i]['JudulBuku'];
                let harga = rows[i]['Harga'];
                let hargaFormatted = harga.toLocaleString('id-ID'); // Format harga
                let coverList = rows[i]['AllCover'];
                let stok = rows[i]['Stok'];
                let url = rows[i]['URL'];

                let carouselId = `carousel-cart-${i}`;

                let indicators = '';
                let carouselItems = '';
                for (let j = 0; j < coverList.length; j++) {
                    if (coverList.length > 1) {
                        indicators += `
                            <button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${j}"
                                class="${j === 0 ? 'active' : ''}" ${j === 0 ? 'aria-current="true"' : ''} 
                                aria-label="Slide ${j + 1}"></button>`;
                    }

                    carouselItems += `
                        <div class="carousel-item ${j === 0 ? 'active' : ''}">
                            <img src="/static/${coverList[j]}" class="d-block w-100 card-book-img1" alt="cover-${j}">
                        </div>`;
                }

                let carouselHTML = '';
                if (coverList.length > 1) {
                    carouselHTML = `
                        <div id="${carouselId}" class="carousel slide" data-bs-ride="carousel">
                            <div class="carousel-indicators">
                                ${indicators}
                            </div>
                            <div class="carousel-inner">
                                ${carouselItems}
                            </div>
                            <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
                                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span class="visually-hidden">Previous</span>
                            </button>
                            <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
                                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                <span class="visually-hidden">Next</span>
                            </button>
                        </div>`;
                } else {
                    carouselHTML = `
                        <div>
                            <img src="/static/${coverList[0]}" class="d-block w-100 card-book-img1" alt="cover-0">
                        </div>`;
                }

                let temp_html = `
                    <div class="col">
                        <div class="card card-book">
                            <a href="/detail/${url}">${carouselHTML}</a>
                            <div class="card-body">
                                <h5 id="judul-${i}" class="fw-semibold text-center text-truncate d-flex align-items-center justify-content-center"
                                    style="min-height: 3rem; font-size: clamp(0.9rem, 1.2vw, 1.2rem); line-height: 1.2;">
                                ${judul}
                                </h5>
                                <h6>Stok : ${stok}</h6>
                                <p class="d-none" id="ori-${i}">${harga}</p>
                                <h5 class="regular py-2 harga" id="harga-${i}">Rp.${hargaFormatted}</h5>
                            </div>
                            <div class="d-flex justify-content-around align-items-center gap-3">
                                <button type="button" class="btn btn-danger rounded-circle btn-lg tombol-jumlah"
                                    onclick="minus('#jumlah-${i}', '#harga-${i}', '#ori-${i}', '${url}')">
                                    <i class="fas fa-minus"></i>
                                </button>

                                <h5 class="mb-0 fw-bold" id="jumlah-${i}" style="min-width: 40px; text-align: center;">1</h5>

                                <button type="button" class="btn btn-success rounded-circle btn-lg tombol-jumlah"
                                    onclick="plus('#jumlah-${i}', '#harga-${i}', '#ori-${i}', '${stok}')">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                    </div>`;
                all_html += temp_html;
            }

            let grid_wrapper = `<div class="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4">${all_html}</div>`;

            if (rows.length > 0) {
                checkout_button = `
                    <div class="text-center mt-5">
                        <button type="button" class="btn btn-lg bold btn-checkout" onclick="ModalCheckOut()">Check Out</button>
                    </div>`;
            }

            $('#keranjang1').html(grid_wrapper + checkout_button);
        }
    });
}

function check_out(para) {
    let username = $.cookie('username');
    let dataPesanan = para;

    $.ajax({
        type: 'POST',
        url: '/orderan',
        contentType: 'application/json',
        data: JSON.stringify({
            username_give: username,
            pesanan_give: dataPesanan
        }),
        success: function (response) {
            if (response.result === 'success') {
                Swal.fire({
                    toast: true,
                    position: 'top-start',
                    icon: 'success',
                    title: response["msg"],
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true
                });
                showcart();
            } else {
                Swal.fire({
                    toast: true,
                    position: 'top-start',
                    icon: 'error',
                    title: 'Ada yang salah',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true
                });
            }
        }
    });
}

function plus(para1, para2, para3, stok) {
    let angka = Number($(para1).text());
    if (angka >= stok) {
        Swal.fire({
            toast: true,
            position: 'top-start',
            icon: 'warning',
            title: 'Melebihi Stok!',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });
        return;
    }

    let jumlah = angka + 1;

    // Ambil harga asli dari hidden field
    let hargaori = Number($(para3).text());

    let total = jumlah * hargaori;

    $(para1).text(`${jumlah}`);
    $(para2).text(`Rp.${total.toLocaleString('id-ID')}`);
}

function minus(para1, para2, para3, para4) {
    let angka = Number($(para1).text());
    if (angka === 1) {
        let judul = para4;
        let username = $.cookie("username");
        $.ajax({
            type: 'POST',
            url: '/addcart',
            data: {
                judul_give: judul,
                username_give: username,
                action_give: "delete"
            },
            success: function (response) {
                if (response.result === 'success') {
                    Swal.fire({
                        toast: true,
                        position: 'top-start',
                        icon: 'info',
                        title: 'Terhapus dari keranjang',
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true
                    });
                    showcart();
                } else {
                    Swal.fire({
                        toast: true,
                        position: 'top-start',
                        icon: 'error',
                        title: 'Ada yang salah',
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true
                    });
                }
            }
        });
    } else {
        let jumlah = angka - 1;
        let hargaori = Number($(para3).text());
        let total = jumlah * hargaori;

        $(para1).text(`${jumlah}`);
        $(para2).text(`Rp.${total.toLocaleString('id-ID')}`);
    }
}


// Page Detail
function roledetail() {
    let role = $.cookie('role');
    $('#navadmindetail').hide();
    $('#navuserdetail').hide();
    if (role === 'admin') {
        $('#navadmindetail').show();
        $('#navnotuserdetail').hide();
    }
    if (role === 'user') {
        $('#navuserdetail').show();
        $('#navnotuserdetail').hide();
    }
}

function detail() {
    let judul = detail_book['JudulBuku'];
    let deskripsi = detail_book['Deskripsi'];
    let harga = detail_book['Harga'];
    let kategori = detail_book['Kategori'];
    let stok = detail_book['Stok'];
    let coverList = detail_book['AllCover']; // Asumsikan ini array path cover
    let formattedHarga = harga.toLocaleString('id-ID');

    let carouselId = `carousel-detail`;

    // Carousel Indicators & Items
    let indicators = '';
    let carouselItems = '';
    for (let j = 0; j < coverList.length; j++) {
        if (coverList.length > 1) {
            indicators += `
                <button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${j}" 
                    class="${j === 0 ? 'active' : ''}" ${j === 0 ? 'aria-current="true"' : ''} 
                    aria-label="Slide ${j + 1}"></button>`;
        }

        carouselItems += `
            <div class="carousel-item ${j === 0 ? 'active' : ''}" data-bs-interval="3000">
                <img src="/static/${coverList[j]}" class="d-block w-100 card-book-img" alt="cover-${j}">
            </div>`;
    }

    // Gabungkan jadi carousel HTML
    let carouselHTML = `
        <div id="${carouselId}" class="carousel slide" data-bs-ride="carousel">
            ${coverList.length > 1 ? `<div class="carousel-indicators">${indicators}</div>` : ''}
            <div class="carousel-inner">
                ${carouselItems}
            </div>
            ${coverList.length > 1 ? `
            <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
            </button>` : ''}
        </div>`;

    let temp_html = `
    <div class="col mb-5">
        <div class="card-book2 shadow" style="max-width: 450px;">
            ${carouselHTML}
        </div>
    </div>

    <div class="col-7">
        <div class="p-4 shadow rounded-4" style="background-color: #ffffff78;">
            <h1 class="fw-bold mb-4">${judul}</h1>

            <h6 class="fw-semibold mb-3">Deskripsi Barang</h6>
            <p class="mb-4">${deskripsi}</p>

            <table>
                <tbody>
                    <tr>
                        <th scope="row" class="fw-semibold" style="width: 120px;">Harga</th>
                        <td>: <span class="fw-bold">Rp.${formattedHarga},-</span></td>
                    </tr>
                    <tr>
                        <th scope="row" class="fw-semibold">Kategori</th>
                        <td>: ${kategori}</td>
                    </tr>
                    <tr>
                        <th scope="row" class="fw-semibold">Stok</th>
                        <td>: ${stok}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>`;

    $('#detailbuku').append(temp_html);
}


// Page EditBook
function edit() {
    let judul = book_info['JudulBuku'];
    let deskripsi = book_info['Deskripsi'];
    let harga = book_info['Harga'];
    let kategori = book_info['Kategori'];
    let stok = book_info['Stok'];
    let coverList = book_info['AllCover']; // diasumsikan array of image paths
    let carouselId = `carouselDetail`; // Bisa diganti `carouselDetail-${i}` jika looping

    // Carousel Indicators & Items
    let indicators = '';
    let carouselItems = '';

    for (let j = 0; j < coverList.length; j++) {
        if (coverList.length > 1) {
            indicators += `
                <button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${j}" 
                    class="${j === 0 ? 'active' : ''}" ${j === 0 ? 'aria-current="true"' : ''} 
                    aria-label="Slide ${j + 1}"></button>`;
        }

        carouselItems += `
            <div class="carousel-item ${j === 0 ? 'active' : ''}" data-bs-interval="3000">
                <img src="/static/${coverList[j]}" class="d-block w-100 detail-img" alt="cover-${j}">
            </div>`;
    }

    // Tombol prev/next hanya jika lebih dari 1 gambar
    let controls = '';
    if (coverList.length > 1) {
        controls = `
            <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
            </button>`;
    }

    let temp_html = `
    <div class="col">
        <div id="${carouselId}" class="carousel slide" data-bs-ride="carousel" style="max-width: 450px; margin-bottom: 20px;">
            ${coverList.length > 1 ? `<div class="carousel-indicators">${indicators}</div>` : ''}
            <div class="carousel-inner">
                ${carouselItems}
            </div>
            ${controls}
        </div>
        <div class="d-flex">
            <div class="custom-file-input">
                <label for="gambar-buku">Pilih File</label>
                <input type="file" id="gambar-buku" name="gambar-buku" multiple accept="image/*">
            </div>
            <button onclick="editgambar()" class="btn btn-login ms-3" style="max-width: 110px;">Perbarui</button>
        </div>
    </div>

    <div class="col-7">
        <div class="card px-5 py-3" style="border: 1px solid rgb(112, 112, 112);" >
            <div class="form-group">
                <label for="kategori">Nama Barang:</label>
                <input type="text" id="judul" name="judul"
                    value="${judul}">
            </div>
            <div class="form-group">
                <label for="deskripsi">Deskripsi Barang:</label>
                <textarea class="me-4" id="deskripsi" name="deskripsi" rows="4">${deskripsi}</textarea>
            </div>
            <div class="form-group">
                <label for="harga">Harga Barang:</label>
                <input class="me-4" type="number" id="harga" name="harga" value="${harga}">
            </div>
            <div class="form-group">
                <label for="stok">Stok Barang:</label>
                <input class="me-4" type="number" id="stok" name="stok" value="${stok}">
            </div>
            <div class="form-group">
                <label for="kategori">Kategori Barang:</label>
                <select class="me-4" id="kategori" name="kategori">
                    <option value="${kategori}">${kategori}</option>
                    <option value="..." disabled>...</option>
                    <option value="ATK">ATK</option>
                    <option value="Makanan">Makanan</option>
                    <option value="Minuman">Minuman</option>
                    <option value="Seragam">Seragam</option>
                    <option value="Alat Multimedia">Alat Multimedia</option>
                    <option value="Lainnya">Lainnya</option>
                </select>
            </div>
            <div class="d-flex">    
                <button onclick="check_judul_e('${judul}')" class="btn semibold btn-login mb-3">Perbarui</button>
                <a href="/adminpage"><button class="btn semibold btn-back ms-3">Kembali</button></a>
            </div>
        </div>
    </div>
    `;
    $('#editbuku').append(temp_html);
}

function editgambar() {
    let waktu = book_info['Date'];
    let gambarList = $("#gambar-buku").prop("files");
    if (!gambarList) {
        return Swal.fire({
            toast: true,
            position: 'top-start',
            icon: 'warning',
            title: 'Silahkan input gambar!',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });
    }

    let form_data = new FormData();
    for (let i = 0; i < gambarList.length; i++) {
        form_data.append("gambar_give[]", gambarList[i]);
    }
    form_data.append("waktu_give", waktu);
    $.ajax({
        type: 'POST',
        url: '/editcover',
        data: form_data,
        cache: false,
        contentType: false,
        processData: false,
        success: function (response) {
            Swal.fire({
                toast: true,
                position: 'top-start',
                icon: 'success',
                title: response["msg"],
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true
            });
            edit();
        }
    });
}

function editing() {
    let waktu = book_info['Date'];
    let judul = $('#judul').val();
    let deskripsi = $('#deskripsi').val();
    let harga = $('#harga').val();
    let stok = $('#stok').val();
    let kategori = $('#kategori').val();

    let form_data = new FormData();

    form_data.append("judul_update", judul);
    form_data.append("deskripsi_update", deskripsi);
    form_data.append("harga_update", harga);
    form_data.append("stok_update", stok);
    form_data.append("kategori_update", kategori);
    form_data.append("waktu_give", waktu);

    $.ajax({
        type: 'POST',
        url: '/editbuku',
        data: form_data,
        cache: false,
        contentType: false,
        processData: false,
        success: function (response) {
            Swal.fire({
                toast: true,
                position: 'top-start',
                icon: 'success',
                title: response["msg"],
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true
            });
            window.location.reload();
        }
    });
}

// Page Favorit
function showfav() {
    $.ajax({
        type: 'GET',
        url: '/showfav',
        data: {},
        success: function (response) {
            let rows = response['daftarbuku'];
            let favoriteUrls = response['daftarfavorite'].map(fav => fav["JudulBuku"]);
            let cartUrls = response['daftarkeranjang'].map(cart => cart["JudulBuku"]);
            let role = $.cookie('role');

            $('#card-book').empty();

            for (let i = 0; i < rows.length; i++) {
                let judul = rows[i]['JudulBuku'];
                let harga = rows[i]['Harga'];
                let coverList = rows[i]['AllCover'];
                let url = rows[i]['URL'];
                let stok = parseInt(rows[i]['Stok']);

                // Hanya tampilkan jika termasuk favorit
                if (!favoriteUrls.includes(url)) continue;

                // Tombol keranjang
                let cart_btn_html = '';
                if (stok > 0) {
                    let cartClass = cartUrls.includes(url) ? 'fa-cart-arrow-down' : 'fa-cart-plus';
                    cart_btn_html = `<a onclick="keranjang('${url}')">
                        <i class="fas ${cartClass} fa-2x" id="cart-${url}"></i>
                    </a>`;
                } else {
                    cart_btn_html = `<a>
                        <i class="fas fa-cart-plus fa-2x text-muted"
                            id="cart-${url}" title="Stok habis" style="pointer-events: none; opacity: 0.5;"></i>
                    </a>`;
                }

                // Carousel
                let carouselId = `carousel-fav-${i}`;
                let indicators = '';
                let carouselItems = '';
                for (let j = 0; j < coverList.length; j++) {
                    if (coverList.length > 1) {
                        indicators += `
                            <button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${j}"
                                class="${j === 0 ? 'active' : ''}" ${j === 0 ? 'aria-current="true"' : ''}
                                aria-label="Slide ${j + 1}"></button>`;
                    }

                    carouselItems += `
                        <div class="carousel-item ${j === 0 ? 'active' : ''}">
                            <img src="/static/${coverList[j]}" class="d-block w-100 card-book-img1" alt="cover-${j}">
                        </div>`;
                }

                let carouselHTML = '';
                if (coverList.length > 1) {
                    carouselHTML = `
                        <div id="${carouselId}" class="carousel slide" data-bs-ride="carousel">
                            <div class="carousel-indicators">
                                ${indicators}
                            </div>
                            <div class="carousel-inner">
                                ${carouselItems}
                            </div>
                            <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
                                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span class="visually-hidden">Previous</span>
                            </button>
                            <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
                                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                <span class="visually-hidden">Next</span>
                            </button>
                        </div>`;
                } else {
                    carouselHTML = `
                        <div>
                            <img src="/static/${coverList[0]}" class="d-block w-100 card-book-img1" alt="cover-0">
                        </div>`;
                }

                let temp_html = `
                    <div class="col">
                        <div class="card card-book">
                            <a href="/detail/${url}">
                                ${carouselHTML}
                            </a>
                            <div class="card-body">
                                <h5 class="fw-semibold text-center text-truncate d-flex align-items-center justify-content-center"
                                    style="min-height: 3rem; font-size: clamp(0.9rem, 1.2vw, 1.2rem); line-height: 1.2;">
                                ${judul}
                                </h5>
                                <h6>Stok : ${stok}</h6>
                                <h5 class="regular py-2 harga">Rp.${parseInt(harga).toLocaleString('id-ID')}</h5>
                            </div>
                            <div class="d-flex justify-content-between px-2 pb-3" id="book-btn">
                                <a onclick="favorite('${url}')">
                                    <i class="fas fa-heart fa-2x" id="fav-${url}"></i>
                                </a>
                                <a href="/detail/${url}" class="btn semibold card-body-btn">Detail</a>
                                ${cart_btn_html}
                            </div>
                        </div>
                    </div>`;

                $('#card-book').append(temp_html);
            }
        }
    });
}


// Page Home
function tampil() {
    $.ajax({
        type: 'GET',
        url: '/hanyabarang',
        data: {},
        success: function (response) {
            let rows = response['daftarbuku'];
            let role = $.cookie('role');

            for (let i = 0; i < rows.length; i++) {
                let judul = rows[i]['JudulBuku'];
                let deskripsi = rows[i]['Deskripsi'];
                let harga = rows[i]['Harga'];
                let kategori = rows[i]['Kategori'];
                let stok = rows[i]['Stok'];
                let coverList = rows[i]['AllCover']; // array
                let url = rows[i]['URL'];

                if (role === 'admin') {
                    window.location.href = '/adminpage';
                    return;
                }

                if (role === 'user') {
                    window.location.href = '/userpage';
                    return;
                }

                // Handle carousel or single image
                let carouselId = `carousel-${i}`;
                let carouselHTML = '';

                if (coverList.length > 1) {
                    let carouselItems = '';
                    for (let j = 0; j < coverList.length; j++) {
                        carouselItems += `
                        <div class="carousel-item ${j === 0 ? 'active' : ''}">
                            <img src="/static/${coverList[j]}" class="d-block w-100 card-book-img1" alt="cover-${j}">
                        </div>`;
                    }

                    carouselHTML = `
                    <div id="${carouselId}" class="carousel slide" data-bs-ride="carousel">
                        <div class="carousel-inner">
                            ${carouselItems}
                        </div>
                        <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Previous</span>
                        </button>
                        <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Next</span>
                        </button>
                    </div>`;
                } else {
                    carouselHTML = `
                    <div>
                        <img src="/static/${coverList[0]}" class="d-block w-100 card-book-img1" alt="cover-0">
                    </div>`;
                }

                let temp_html = `
                <div class="col">
                    <div class="card card-book">
                        <a href="/detail/${url}">
                            ${carouselHTML}
                        </a>
                        <div class="card-body mt-3">
                            <h5 class="fw-semibold text-center text-truncate d-flex align-items-center justify-content-center"
                                style="min-height: 3rem; font-size: clamp(0.9rem, 1.2vw, 1.2rem); line-height: 1.2;">
                            ${judul}
                            </h5>
                            <h6>Stok : ${stok}</h6>
                            <h5 class="regular py-2 harga" id="harga">Rp.${harga.toLocaleString('id-ID')}</h5>
                        </div>
                        <div class="d-flex justify-content-between px-2 pb-3">
                            <a onclick="kelogin()"><i class="far fa-heart fa-2x"></i></a>
                            <a href="/detail/${url}" class="btn semibold card-body-btn">Detail</a>
                            <a onclick="kelogin()"><i class="fas fa-cart-plus fa-2x"></i></a>
                        </div>
                    </div>
                </div>`;

                $('#card-book').append(temp_html);
            }
        }
    });
}

function kelogin() {
    window.location.replace("/login");
}

function update_profile() {
    let file = $("#profile-user")[0].files[0];
    let email = $("#inputEmail").val();
    let nomor = $('#inputNomor').val();
    let alamat = $("#inputAlamat").val();
    let faceCanvas = document.getElementById("face-capture"); // ← Canvas hasil capture wajah
    // let face_base64 = faceCanvas ? faceCanvas.toDataURL("image/jpeg") : null;

    if (!email || !nomor || !alamat) {
        return Swal.fire({
            toast: true,
            position: 'top-start',
            icon: 'warning',
            title: 'Lengkapi semua data.',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });
    }

    let form_data = new FormData();
    if (file) form_data.append("file_give", file);
    // if (face_base64) form_data.append("face_base64", face_base64);  // ← kirim base64 sebagai string
    form_data.append("email_give", email);
    form_data.append("nomor_give", nomor);
    form_data.append("alamat_give", alamat);

    $.ajax({
        type: "POST",
        url: "/update_profile",
        data: form_data,
        cache: false,
        contentType: false,
        processData: false,
        success: function (response) {
            if (response.result === "success") {
                Swal.fire({
                    toast: true,
                    position: 'top-start',
                    icon: 'success',
                    title: response.msg,
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true
                });
                window.location.reload();
            }
        },
    });
}

// Page Regis Admin
function masukadmin() {
    let username = $('#inputUsername').val();
    if (!username) {
        return Swal.fire({
            toast: true,
            position: 'top-start',
            icon: 'warning',
            title: 'Silahkan isi username anda',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });
    }

    let password = $('#inputPassword').val();
    if (!password) {
        return Swal.fire({
            toast: true,
            position: 'top-start',
            icon: 'warning',
            title: 'Silahkan isi password anda',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });
    }

    let email = $('#inputEmail').val();
    if (!email) {
        return Swal.fire({
            toast: true,
            position: 'top-start',
            icon: 'warning',
            title: 'Silahkan isi email',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });
    }

    let nomor = $('#inputNomor').val();
    if (!nomor) {
        return Swal.fire({
            toast: true,
            position: 'top-start',
            icon: 'warning',
            title: 'Silahkan isi nomor handphone',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });
    }

    let helpId = $("#helpId");
    if (helpId.hasClass("fa-solid") && helpId.hasClass("fa-user")) {
        return Swal.fire({
            toast: true,
            position: 'top-start',
            icon: 'warning',
            title: 'Silahkan cek ID terlebih dahulu',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });
    } else if (helpId.hasClass("fa-solid") && helpId.hasClass("fa-xmark")) {
        return Swal.fire({
            toast: true,
            position: 'top-start',
            icon: 'warning',
            title: 'Username tidak tersedia. Gunakan ID lain.',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });
    }

    $.ajax({
        type: "POST",
        url: "/radmin",
        data: {
            email: email,
            nomor_give: nomor,
            username_give: username,
            password_give: password
        },
        success: function (response) {
            Swal.fire({
                toast: true,
                position: 'top-start',
                icon: 'success',
                title: 'Kamu telah mendaftar sebagai Admin, terima kasih',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true
            });
            window.location.replace("/login");
        }
    });
}

// Page Profile
function profile() {
    let username = user_list['username'];
    let email = user_list['email'];
    let nohp = user_list['nohp'];
    let alamat = user_list['alamat'];
    let profile = user_list['profile_default'];
    let verifikasi = user_list['verifikasi_wajah']; // ← tambahkan ini

    let verifikasiWajahHTML = '';
    if (verifikasi) {
        verifikasiWajahHTML = `<span class="text-success fw-bold">✅ Wajah sudah terverifikasi</span>`;
    } else {
        verifikasiWajahHTML = `<button id="btn-verifikasi-wajah" onclick="openFaceModal()" class="btn btn-secondary">📷 Verifikasi Wajah</button>`;
    }

    let temp_html = `
    <div class="col-4 photo">
        <h2 class="bold mt-3 ms-1">FOTO PROFIL</h2>
        <img src="/static/${profile}" class="img-thumbnail gambar mt-3" alt="Profile">
        <div class="custom-file-input ms-1 mt-4 mb-4 bold">
            <label for="profile-user">Choose File</label>
            <input type="file" id="profile-user" name="profile-user">
        </div>
    </div>
    <div class="col-4 ms-4 info-akun">
        <h3 class="bold mt-3">Informasi Akun</h3>
        <hr>
        <div class="mb-2">
            <label for="inputUsername" class="form-label ps-1">Username</label>
            <input type="email" class="form-control" id="inputUsername" value="${username}" disabled>
        </div>
        <div class="mb-2">
            <label for="inputEmail" class="form-label ps-1">Email :</label>
            <input type="email" class="form-control" id="inputEmail" value="${email}">
        </div>
        <div class="mb-2">
            <label for="inputNomor" class="form-label ps-1">No Handphone / WA :</label>
            <input type="email" class="form-control" id="inputNomor" value="${nohp}">
        </div>
        <div class="mb-2">
            <label for="inputAlamat" class="form-label ps-1">Alamat :</label>
            <textarea class="form-control" id="inputAlamat" rows="2">${alamat}</textarea>
        </div>
        <div class="mb-2">
            ${verifikasiWajahHTML}
        </div>
        <div class="text-center">
            <button type="button" onclick="update_profile()" class="btn mt-3 bold btn-info-save">SAVE</button>
        </div>
    </div>
    <div class="text-center mt-5">
        <button type="button" class="btn btn-lg text-center bold btn-logout" onclick="sign_out()">Log Out</button>
    </div>
    `;

    $('#editprofile').empty().append(temp_html); // pastikan bersihkan sebelum append
}



// Page Regis User
function masuk() {
    let username = $('#inputUsername').val();
    if (!username) {
        return Swal.fire({
            toast: true,
            position: 'top-start',
            icon: 'warning',
            title: 'Silahkan isi username anda',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });
    }

    let password = $('#inputPassword').val();
    if (!password) {
        return Swal.fire({
            toast: true,
            position: 'top-start',
            icon: 'warning',
            title: 'Silahkan isi password anda',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });
    }

    let email = $('#inputEmail').val();
    if (!email) {
        return Swal.fire({
            toast: true,
            position: 'top-start',
            icon: 'warning',
            title: 'Silahkan isi email anda',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });
    }

    let helpId = $("#helpId");
    if (helpId.hasClass("fa-solid") && helpId.hasClass("fa-user")) {
        return Swal.fire({
            toast: true,
            position: 'top-start',
            icon: 'warning',
            title: 'Silahkan cek ID anda terlebih dahulu',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });
    } else if (helpId.hasClass("fa-solid") && helpId.hasClass("fa-xmark")) {
        return Swal.fire({
            toast: true,
            position: 'top-start',
            icon: 'warning',
            title: 'Cek kembali ID anda..',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });
    }

    $.ajax({
        type: "POST",
        url: "/ruser",
        data: {
            email: email,
            username_give: username,
            password_give: password
        },
        success: function (response) {
            Swal.fire({
                toast: true,
                position: 'top-start',
                icon: 'success',
                title: 'Kamu telah mendaftar sebagai User, terima kasih..',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true
            });
            window.location.replace("/login");
        }
    });
}

// Page Search
function rolesearch() {
    let role = $.cookie('role');
    $('#navadmin').hide();
    $('#navuser').hide();
    $('#cardadmin').hide();
    $('#carduser').hide();
    if (role === 'admin') {
        $('#navadmin').show();
        $('#cardadmin').show();
    }
    if (role === 'user') {
        $('#navuser').show();
        $('#carduser').show();
    }
}

// Page Tambah Buku
function postbook() {
    let judul = $('#judul').val();
    if (!judul) {
        return Swal.fire({
            toast: true,
            position: 'top-start',
            icon: 'warning',
            title: 'Silahkan isi nama barang',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });
    }
    let deskripsi = $('#deskripsi').val();
    if (!deskripsi) {
        return Swal.fire({
            toast: true,
            position: 'top-start',
            icon: 'warning',
            title: 'Silahkan isi deskripsi barang',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });
    }
    let harga = $('#harga').val();
    if (!harga) {
        return Swal.fire({
            toast: true,
            position: 'top-start',
            icon: 'warning',
            title: 'Silahkan isi harga barang',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });
    }
    let stok = $('#stok').val();
    if (!stok) {
        return Swal.fire({
            toast: true,
            position: 'top-start',
            icon: 'warning',
            title: 'Silahkan isi stok barang',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });
    }
    let kategori = $('#kategori').val();
    if (!kategori) {
        return Swal.fire({
            toast: true,
            position: 'top-start',
            icon: 'warning',
            title: 'Silahkan isi kategori barang',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });
    }
    let gambarList = $("#gambar-buku").prop("files");
    if (gambarList.length === 0) {
        return Swal.fire({
            toast: true,
            position: 'top-start',
            icon: 'warning',
            title: 'Silahkan input gambar barang',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });
    }

    let url = judul.replaceAll(/[^0-9a-zA-Z -]/g, '').toLowerCase();
    let url1 = url.replaceAll(' ', '-');

    let form_data = new FormData();

    // Tambahkan semua file gambar ke FormData
    for (let i = 0; i < gambarList.length; i++) {
        form_data.append("gambar_give[]", gambarList[i]);
    }

    form_data.append("judul_give", judul);
    form_data.append("deskripsi_give", deskripsi);
    form_data.append("harga_give", harga);
    form_data.append("stok_give", stok);
    form_data.append("kategori_give", kategori);
    form_data.append("url_give", url1);

    $.ajax({
        type: 'POST',
        url: '/tambahbuku',
        data: form_data,
        cache: false,
        contentType: false,
        processData: false,
        success: function (response) {
            Swal.fire({
                toast: true,
                position: 'top-start',
                icon: 'success',
                title: response["msg"],
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true
            });
            window.location.href = '/adminpage';
        }
    });
}

function check_judul_t() {
    let judul = $('#judul').val();
    $.ajax({
        type: "POST",
        url: "/check_judul",
        data: {
            judul_give: judul,
        },
        success: function (response) {
            if (response["exists"]) {
                Swal.fire({
                    toast: true,
                    position: 'top-start',
                    icon: 'warning',
                    title: 'Judul sudah digunakan',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true
                });
            } else {
                postbook();
            }
        },
    });
}

function check_judul_e(para) {
    let judul = $('#judul').val();
    let judulori = para
    if (judul === judulori) {
        editing()
    }
    else {
        $.ajax({
            type: "POST",
            url: "/check_judul",
            data: {
                judul_give: judul,
            },
            success: function (response) {
                if (response["exists"]) {
                    Swal.fire({
                        toast: true,
                        position: 'top-start',
                        icon: 'warning',
                        title: 'Judul sudah digunakan',
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true
                    });
                } else {
                    editing();
                }
            },
        });
    }
}

function toggleDropdown() {
    const dropdown = document.getElementById("profileDropdown");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

// Tutup dropdown saat klik di luar
window.onclick = function (event) {
    if (!event.target.closest('.dropdown')) {
        const dropdown = document.getElementById("profileDropdown");
        if (dropdown) dropdown.style.display = "none";
    }
}


function formatTanggal(datetimeStr) {
    const bulanIndo = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const date = new Date(datetimeStr);
    const day = date.getDate();
    const month = bulanIndo[date.getMonth()];
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day} ${month} ${year} | ${hours}:${minutes}:${seconds}`;
}

function showorder() {
    $.ajax({
        type: 'GET',
        url: '/showorder',
        success: function (response) {
            let rows = response['daftarorderan'];
            if (!rows || rows.length === 0) return;

            $('#showoderan').empty();

            let groupedOrders = {};
            for (let item of rows) {
                let key = item['order_id'] + "_" + item['tanggal'];
                groupedOrders[key] = groupedOrders[key] || [];
                groupedOrders[key].push(item);
            }

            let sortedGroups = Object.entries(groupedOrders).sort((a, b) => {
                let dateA = new Date(a[1][0].tanggal);
                let dateB = new Date(b[1][0].tanggal);
                return dateB - dateA;
            }).reverse();

            for (let [key, group] of sortedGroups) {
                let { order_id: id, tanggal: waktu } = group[0];
                let totalSemua = 0;
                let jumlahSemua = 0;
                let status = group[0].status.toLowerCase();
                let statusPembatalan = group[0].status_pembatalan;

                let itemHTML = group.map((item, idx) => {
                    let jumlah = parseInt(item.jumlah);
                    let harga = parseInt(item.harga);

                    totalSemua += harga;
                    jumlahSemua += jumlah;

                    let carouselId = `carousel-${id}-${idx}`;
                    let covers = item.AllCover || [];
                    let indicators = '';
                    let inner = '';

                    for (let i = 0; i < covers.length; i++) {
                        let activeClass = i === 0 ? 'active' : '';
                        indicators += `
                            <button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${i}" class="${activeClass}" aria-current="${activeClass ? 'true' : 'false'}" aria-label="Slide ${i + 1}"></button>
                        `;
                        inner += `
                            <div class="carousel-item ${activeClass}">
                                <img src="/static/${covers[i]}" class="d-block w-100 rounded-3 img-ord" alt="Cover ${i + 1}">
                            </div>
                        `;
                    }

                    return `
                        <div class="row g-4 align-items-center py-3 border-bottom order-group" data-orderid="${id}">
                            <div class="col-md-4">
                                <div id="${carouselId}" class="carousel slide" data-bs-ride="carousel">
                                    <div class="carousel-indicators">${indicators}</div>
                                    <div class="carousel-inner rounded-3">${inner}</div>
                                    <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
                                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                        <span class="visually-hidden">Previous</span>
                                    </button>
                                    <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
                                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                        <span class="visually-hidden">Next</span>
                                    </button>
                                </div>
                            </div>
                            <div class="col-md-8">
                                <h4 class="fw-bold text-info">${item.judul}</h4>
                                <ul class="list-group list-group-flush">
                                    <li class="list-group-item d-flex justify-content-between">
                                        <strong>Jumlah:</strong>
                                        <span class="item-jumlah">${item.jumlah}</span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between">
                                        <strong>Total:</strong>
                                        <span class="item-harga">Rp.${item.harga.toLocaleString('id-ID')}</span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between">
                                        <strong>Status:</strong>
                                        <span class="${status === 'belum bayar' ? 'text-danger' : 'text-success'}">${item.status}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    `;
                }).join('');

                // Tombol Pembatalan
                let tombolPembatalan = '';
                if (status !== 'belum bayar') {
                    if (statusPembatalan === 'diajukan') {
                        tombolPembatalan = `
                            <button id="btn-batal-${id}" class="btn btn-warning" type="button" onclick="batalkanPermintaanPembatalan('${id}')">🔁 Batalkan Pembatalan</button>
                        `;
                    } else {
                        tombolPembatalan = `
                            <button id="btn-batal-${id}" class="btn btn-outline-warning" type="button" onclick="batalkanPesanan('${id}')">❌ Batalkan Pesanan</button>
                        `;
                    }
                }

                // Tombol Aksi
                let tombolAksi = '';
                if (status === 'belum bayar') {
                    tombolAksi = `
                        <div class="d-flex justify-content-center gap-2 mt-3">
                            <button class="btn btn-outline-danger" type="button" onclick="verifikasiSebelumBayar('${id}', ${jumlahSemua}, ${totalSemua}, '${waktu}')">Bayar</button>
                            <button class="btn btn-outline-secondary" type="button" onclick="hapusPesanan('${id}')">🗑️ Hapus Pesanan</button>
                        </div>
                    `;
                } else {
                    tombolAksi = `
                        <div class="d-flex justify-content-center gap-2 mt-3">
                            <button class="btn btn-outline-success" type="button" onclick="chatPenjual('${id}')">💬 Chat Penjual</button>
                            ${tombolPembatalan}
                        </div>
                    `;
                }

                let temp_html = `
                    <div class="card shadow-lg p-4 rounded-4 mb-4" id="order-card-${id}">
                        <h4 class="mb-3">${formatTanggal(waktu)}</h4>
                        ${itemHTML}
                        ${status === 'belum bayar' ? `
                            <div class="text-end mt-3">
                                <strong>Batas Waktu: <span id="countdown-${id}" class="text-danger"></span></strong>
                            </div>` : ''
                    }
                        ${tombolAksi}
                    </div>
                `;

                $('#showoderan').append(temp_html);

                if (status === 'belum bayar') {
                    startCountdown(id, waktu);
                }
            }
        },
        error: function () {
            Swal.fire("Error", "Gagal mengambil data pesanan dari server", "error");
        }
    });
}

function chatPenjual(orderid) {
    openChat(orderid); // Panggil fungsi buka popup chat
}

function formatTime(timestampStr) {
    const [datePart, timePart] = timestampStr.split(" ");
    if (!datePart || !timePart) return timestampStr;

    const [year, month, day] = datePart.split("-");
    const [hour, minute] = timePart.split(":");

    const msgDate = new Date(`${year}-${month}-${day}T${hour}:${minute}`);
    const now = new Date();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const msgDay = new Date(msgDate.getFullYear(), msgDate.getMonth(), msgDate.getDate());

    const diffTime = msgDay.getTime() - today.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays === 0) {
        // Hari ini → cuma HH:MM
        return `${hour}:${minute}`;
    } else if (diffDays === -1) {
        // Kemarin → Kemarin, HH:MM
        return `Kemarin, ${hour}:${minute}`;
    } else {
        // Tanggal lain → DD/MM/YYYY, HH:MM
        return `${day}/${month}/${year}, ${hour}:${minute}`;
    }
}

function getCookie(name) {
    let cookieArr = document.cookie.split(";");
    for (let i = 0; i < cookieArr.length; i++) {
        let cookiePair = cookieArr[i].split("=");
        if (name == cookiePair[0].trim()) {
            return decodeURIComponent(cookiePair[1]);
        }
    }
    return null;
}

setInterval(loadChat, 5000);


function batalkanPesanan(id) {
    let username = $.cookie("username");
    Swal.fire({
        title: "Ajukan Pembatalan?",
        text: "Apakah Anda yakin ingin mengajukan pembatalan pesanan ini?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, ajukan!",
        cancelButtonText: "Batal"
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                type: "POST",
                url: "/ajukan-pembatalan",
                data: {
                    id_give: id,
                    username_give: username
                },
                success: function (response) {
                    Swal.fire({
                        toast: true,
                        position: 'top-start',
                        icon: 'info',
                        title: response["msg"],
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true
                    });
                    showorder();
                },
                error: function () {
                    alert("Gagal mengajukan pembatalan pesanan.");
                }
            });
        }
    });
}

function batalkanPermintaanPembatalan(id) {
    Swal.fire({
        title: "Batalkan permintaan pembatalan?",
        text: "Yakin ingin membatalkan permintaan pembatalan untuk pesanan ini?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya, batalkan",
        cancelButtonText: "Tidak"
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                type: "POST",
                url: "/batal-pembatalan",  // Pastikan route ini ada di Flask
                data: { order_id: id },
                success: function (res) {
                    Swal.fire({
                        toast: true,
                        position: 'top-start',
                        icon: 'success',
                        title: res.msg,
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true
                    });
                    showorder(); // refresh tampilan
                },
                error: function () {
                    Swal.fire({
                        toast: true,
                        position: 'top-start',
                        icon: 'error',
                        title: 'Tidak bisa membatalkan permintaan.',
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true
                    });
                }
            });
        }
    });
}

function testpembayaran(orderid, jumlah, total, tanggal) {
    Swal.fire({
        title: 'Konfirmasi Pembayaran',
        html: `Yakin ingin mengonfirmasi pembayaran untuk Order ID <b>${orderid}</b>?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Bayar',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                type: 'POST',
                url: '/bayar-test',
                data: {
                    orderid_give: orderid,
                    jumlah_give: jumlah,
                    total_give: total,
                    tanggal_give: tanggal
                },
                success: function (res) {
                    Swal.fire({
                        icon: 'success',
                        title: res.msg || 'Pembayaran berhasil',
                        toast: true,
                        position: 'top-end',
                        timer: 2000,
                        showConfirmButton: false
                    });
                    showorder();  // Refresh tampilan order jika perlu
                },
                error: function () {
                    Swal.fire('Error', 'Gagal memproses pembayaran', 'error');
                }
            });
        }
    });
}


function pembayaran(orderid, jumlah, total, tanggal) {
    let username = $.cookie('username');

    if (!username || isNaN(jumlah) || isNaN(total)) {
        alert("Data checkout tidak valid.");
        return;
    }

    $.ajax({
        type: 'POST',
        url: '/bayar',
        data: {
            username_give: username,
            jumlah_give: jumlah,
            total_give: total,
            orderid_give: orderid,
            tanggal_give: tanggal
        },
        success: function (response) {
            if (response.result === 'success' && response.snap_token) {
                window.snap.pay(response.snap_token, {
                    onSuccess: function () {
                        alert("Pembayaran berhasil!");
                        location.reload();
                    },
                    onPending: function () {
                        alert("Menunggu pembayaran...");
                    },
                    onError: function () {
                        alert("Terjadi kesalahan dalam pembayaran.");
                    },
                    onClose: function () {
                        alert('Kamu menutup popup pembayaran.');
                    }
                });
            } else {
                alert('Gagal memulai pembayaran.');
                console.error('Response:', response);
            }
        },
        error: function (xhr, status, error) {
            alert("Terjadi kesalahan saat menghubungi server.");
            console.error("AJAX error:", status, error);
        }
    });
}

function startCountdown(id, orderTime) {
    const orderDate = new Date(orderTime);
    if (isNaN(orderDate)) {
        console.error(`Invalid date: ${orderTime}`);
        return;
    }

    const expiration = orderDate.getTime() + 24 * 60 * 60 * 1000;

    const timer = setInterval(() => {
        const now = Date.now();
        const distance = expiration - now;

        if (distance <= 0) {
            clearInterval(timer);
            $(`#countdown-${id}`).text('Expired');
            $(`#order-card-${id}`).remove();

            // ✅ AJAX pakai form-data (bukan JSON)
            $.ajax({
                type: 'POST',
                url: '/hapus-pesanan',
                data: { order_id: id }, // ⬅ sesuai Flask backend
                success: function (res) {
                    console.log('Order deleted:', res);
                },
                error: function (err) {
                    console.error('Gagal hapus otomatis:', err);
                }
            });

        } else {
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            $(`#countdown-${id}`).text(`${hours}j ${minutes}m ${seconds}d`);
        }
    }, 1000);
}


function hapusPesanan(orderId) {
    Swal.fire({
        title: 'Hapus Pesanan?',
        text: "Pesanan akan dihapus dan tidak bisa dikembalikan.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: '🗑️ Hapus',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                type: 'POST',
                url: '/hapus-pesanan',
                data: { order_id: orderId },
                success: function (response) {
                    Swal.fire({
                        toast: true,
                        position: 'top-start',
                        icon: 'success',
                        title: response.msg || 'Pesanan berhasil dihapus.',
                        showConfirmButton: false,
                        timer: 1000,
                        timerProgressBar: true
                    }).then(() => {
                        location.reload(); // reload halaman setelah hapus
                    });
                },
                error: function () {
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal',
                        text: 'Gagal menghapus pesanan. Silakan coba lagi.',
                        confirmButtonColor: '#d33'
                    });
                    Swal.fire({
                        toast: true,
                        position: 'top-start',
                        icon: 'error',
                        title: 'Gagal menghapus pesanan. Silakan coba lagi.',
                        showConfirmButton: false,
                        timer: 1000,
                        timerProgressBar: true
                    });
                }
            });
        }
    });
}

function showorderadmin() {
    $.ajax({
        type: 'GET',
        url: '/dbadmin',
        success: function (response) {
            let rows = response['daftarorder'];
            if (!rows || rows.length === 0) return;

            $('#showoderanadmin').empty();

            let groupedOrders = {};
            for (let item of rows) {
                let key = item['order_id'] + "_" + item['tanggal'];
                groupedOrders[key] = groupedOrders[key] || [];
                groupedOrders[key].push(item);
            }

            let sortedGroups = Object.entries(groupedOrders).sort((a, b) => {
                let dateA = new Date(a[1][0].tanggal);
                let dateB = new Date(b[1][0].tanggal);
                return dateB - dateA;
            }).reverse();

            for (let [key, group] of sortedGroups) {
                let { order_id: id, tanggal: waktu } = group[0];
                let totalSemua = 0;
                let jumlahSemua = 0;
                let status = group[0].status.toLowerCase();
                let statusPembatalan = group[0].status_pembatalan;
                let username = group[0].username;

                let itemHTML = group.map((item, idx) => {
                    let jumlah = parseInt(item.jumlah);
                    let harga = parseInt(item.harga);

                    totalSemua += harga;
                    jumlahSemua += jumlah;

                    let carouselId = `carousel-${id}-${idx}`;
                    let covers = item.AllCover || [];
                    let indicators = '';
                    let inner = '';

                    for (let i = 0; i < covers.length; i++) {
                        let activeClass = i === 0 ? 'active' : '';
                        indicators += `<button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${i}" class="${activeClass}" aria-current="${activeClass ? 'true' : 'false'}" aria-label="Slide ${i + 1}"></button>`;
                        inner += `<div class="carousel-item ${activeClass}"><img src="/static/${covers[i]}" class="d-block w-100 rounded-3 img-ord" alt="Cover ${i + 1}"></div>`;
                    }

                    return `
                        <div class="row g-4 align-items-center py-3 border-bottom order-group" data-orderid="${id}">
                            <div class="col-md-4">
                                <div id="${carouselId}" class="carousel slide" data-bs-ride="carousel">
                                    <div class="carousel-indicators">${indicators}</div>
                                    <div class="carousel-inner rounded-3">${inner}</div>
                                    <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
                                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                        <span class="visually-hidden">Previous</span>
                                    </button>
                                    <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
                                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                        <span class="visually-hidden">Next</span>
                                    </button>
                                </div>
                            </div>
                            <div class="col-md-8">
                                <h4 class="fw-bold text-info">${item.judul}</h4>
                                <ul class="list-group list-group-flush">
                                    <li class="list-group-item d-flex justify-content-between">
                                        <strong>Jumlah:</strong>
                                        <span class="item-jumlah">${item.jumlah}</span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between">
                                        <strong>Total:</strong>
                                        <span class="item-harga">Rp.${item.harga.toLocaleString('id-ID')}</span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between">
                                        <strong>Status:</strong>
                                        <span class="${status === 'belum bayar' ? 'text-danger' : 'text-success'}">${item.status}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    `;
                }).join('');

                // Tombol Aksi Admin
                let tombolAksi = '';
                if (status === 'sudah bayar') {
                    tombolAksi = `
                        <div class="d-flex justify-content-center gap-2 mt-3">
                            <button class="btn btn-outline-success" onclick="kirimPesanan('${id}', '${username}')">📦 Kirim Pesanan</button>
                            <button class="btn btn-outline-danger" onclick="konfirmasiPembatalan('${id}', '${username}')">❌ Konfirmasi Pembatalan</button>
                            <button class="btn btn-outline-info" onclick="chatUser('${id}','${username}')">💬 Chat User</button>
                        </div>
                    `;
                } else {
                    tombolAksi = `
                        <div class="d-flex justify-content-center mt-3">
                            <button class="btn btn-outline-info" onclick="chatUser('${id}', '${username}')">💬 Chat User</button>
                        </div>
                    `;
                }

                let temp_html = `
                    <div class="card shadow-lg p-4 rounded-4 mb-4" id="order-card-${id}">
                        <h4 class="mb-3">${formatTanggal(waktu)} - <span class="text-primary">${username}</span></h4>
                        ${itemHTML}
                        ${tombolAksi}
                    </div>
                `;

                $('#showoderanadmin').append(temp_html);
            }
        },
        error: function () {
            Swal.fire("Error", "Gagal mengambil data order dari server", "error");
        }
    });
}

function lihatUser() {
    $.ajax({
        type: 'GET',
        url: '/dbadmin',
        success: function (res) {
            const users = res.daftaruser;
            const tbody = $('#userTableBody');
            tbody.empty();

            users.forEach(user => {
                const foto = user.profile_default ? `/static/${user.profile_default}` : '/static/default.png';
                const email = user.email || '-';
                const nohp = user.nohp || '-';
                const alamat = user.alamat || '-';

                const row = `
            <tr class="text-center">
              <td><img src="${foto}" alt="foto-${user.username}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;"></td>
              <td>${user.username}</td>
              <td>${email}</td>
              <td>${nohp}</td>
              <td>${alamat}</td>
              <td>
                <button class="btn btn-danger btn-sm" onclick="hapusUser('${user.username}')">Hapus</button>
                <button class="btn btn-warning btn-sm" onclick="resetPassword('${user.username}')">Reset Password</button>
              </td>
            </tr>`;
                tbody.append(row);
            });
        },
        error: function () {
            alert('Gagal mengambil data user');
        }
    });
}

function hapusUser(username) {
    Swal.fire({
        title: `Yakin ingin menghapus user "${username}"?`,
        text: "Tindakan ini tidak dapat dibatalkan.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Hapus",
        cancelButtonText: "Batal"
    }).then((result) => {
        if (result.isConfirmed) {
            $.post('/hapus-user', { username_give: username }, function (res) {
                Swal.fire({
                    icon: 'success',
                    title: res.msg,
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true
                });
                $('#userModal').modal('hide');
            });
        }
    });
}

function resetPassword(username) {
    Swal.fire({
        title: `Reset password user "${username}"?`,
        text: "Password akan diubah menjadi '12345678'.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#0d6efd",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Reset",
        cancelButtonText: "Batal"
    }).then((result) => {
        if (result.isConfirmed) {
            $.post('/reset-password', { username_give: username }, function (res) {
                Swal.fire({
                    icon: 'success',
                    title: res.msg,
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true
                });
            });
        }
    });
}