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
            if (response["result"] === "success") {
                $.removeCookie('mytoken', { path: '/' });
                $.removeCookie('role', { path: '/' });
                $.cookie("mytoken", response["token"], { path: "/" });
                $.cookie("role", response["role"], { path: "/" });
                $.cookie("username", response["username"], { path: "/" });

                if (response["role"] === "admin") {
                    window.location.replace("/adminpage");
                } else if (response["role"] === "user") {
                    window.location.replace("/userpage");
                } else {
                    window.location.replace("/");
                }
            } else {
                let titleMsg = response["msg"];
                let iconType = 'error';

                Swal.fire({
                    toast: true,
                    position: 'top-start',
                    icon: iconType,
                    title: titleMsg,
                    showConfirmButton: false,
                    timer: 1500,
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
                        timer: 1000,
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
                        timer: 1000,
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
    let judul = $(para).data('judul');

    Swal.fire({
        title: `Hapus Barang?`,
        text: `Apakah Anda yakin ingin menghapus "${judul}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                type: 'POST',
                url: '/deletebook',
                data: { judul_give: judul },
                success: function (response) {
                    if (response.result === 'success') {
                        Swal.fire({
                            toast: true,
                            position: 'top-start',
                            icon: 'success',
                            title: response.msg,
                            showConfirmButton: false,
                            timer: 2000,
                            timerProgressBar: true
                        });
                        location.reload(); // Refresh
                    } else {
                        Swal.fire({
                            toast: true,
                            position: 'top-start',
                            icon: 'error',
                            title: 'Gagal menghapus',
                            showConfirmButton: false,
                            timer: 2000,
                            timerProgressBar: true
                        });
                    }
                }
            });
        }
    });
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
                            <a href="#" onclick="lihatUser()" class="text-decoration-none text-dark fw-semibold" data-bs-toggle="modal" data-bs-target="#userModal">Pengguna</a>
                        </p>
                    </div>
                    <i class="fa-solid fa-user"></i>
                </div>
                <div class="box box-bg2 my-2 mx-2">
                    <div class="info">
                        <h3 class="semibold">Transaksi</h3>
                        <p class="count regular"><b style="color: #d8410080;">${count}</b> <a href="#" onclick="lihatOrder()" class="text-decoration-none text-dark fw-semibold">Orders</a></p>
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
                        <img src="${coverList[j]}" class="d-block w-100 card-book-img1" alt="cover-${j}">
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
                        <img src="${coverList[0]}" class="d-block w-100 card-book-img1" alt="cover-0">
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
                        <div class="d-flex justify-content-center">
                            <a href="/edit/${url}" class="btn semibold card-admin-btn" style="background-color: #0A868C;">Edit</a>
                            <button onclick="deleteadm(this)" class="btn semibold card-admin-btn ms-4" style="background-color: #D60000;" data-judul="${judul}">Delete</button>
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
                            <img src="${coverList[j]}" class="d-block w-100 card-book-img1" alt="cover-${j}">
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
                        <img src="${coverList[0]}" class="d-block w-100 card-book-img1" alt="cover-0">
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
                            <img src="${coverList[j]}" class="d-block w-100 card-book-img1" alt="cover-${j}">
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
                            <img src="${coverList[0]}" class="d-block w-100 card-book-img1" alt="cover-0">
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

            // if (rows.length > 0) {
            //     checkout_button = `
            //         <div class="text-center mt-5">
            //             <button type="button" class="btn btn-lg bold btn-checkout" onclick="sebelumco()">Check Out</button>
            //         </div>`;
            // }

            $('#keranjang1').html(grid_wrapper);
        }
    });
}

function sebelumco() {
    let dataPesanan = [];
    let pilihanHTML = '';

    $("[id^='harga-']").each(function (index) {
        let hargaText = $(this).text();
        let harga = Number(hargaText.replace(/\D/g, ''));
        let jumlah = Number($(`#jumlah-${index}`).text());
        let judul = $(`#judul-${index}`).text().trim();

        if (jumlah > 0 && harga > 0) {
            let idCheckbox = `item-${index}`;
            dataPesanan.push({
                id: idCheckbox,
                judul,
                jumlah,
                harga
            });

            // ❗ Otomatis dicentang dengan "checked" di HTML
            pilihanHTML += `
                <div class="form-check text-start">
                    <input class="form-check-input item-checkbox" type="checkbox" value="${index}" id="${idCheckbox}" checked>
                    <label class="form-check-label" for="${idCheckbox}">
                        ${judul} (x${jumlah}) - Rp ${harga.toLocaleString('id-ID')}
                    </label>
                </div>
            `;
        }
    });

    if (dataPesanan.length === 0) {
        return Swal.fire({
            icon: 'error',
            title: 'Gagal!',
            text: 'Tidak ada item yang dipilih',
            confirmButtonColor: '#625f5f',
            confirmButtonText: 'OK'
        });
    }

    Swal.fire({
        title: 'Pilih pesanan untuk checkout',
        html: `
            <div class="mb-3 text-start">
                <input type="checkbox" id="select-all" class="form-check-input me-2" checked>
                <label for="select-all" class="form-check-label fw-bold">Pilih Semua</label>
            </div>
            <form id="form-pilihan">${pilihanHTML}</form>
        `,
        showCancelButton: true,
        confirmButtonText: 'Checkout',
        cancelButtonText: 'Batal',
        didOpen: () => {
            const selectAll = document.getElementById('select-all');
            const checkboxes = document.querySelectorAll('.item-checkbox');

            // Handle toggle semua checkbox
            selectAll.addEventListener('change', () => {
                checkboxes.forEach(cb => cb.checked = selectAll.checked);
            });

            // Jika user uncheck salah satu, uncheck "Pilih Semua"
            checkboxes.forEach(cb => {
                cb.addEventListener('change', () => {
                    if (!cb.checked) {
                        selectAll.checked = false;
                    } else if ([...checkboxes].every(c => c.checked)) {
                        selectAll.checked = true;
                    }
                });
            });
        },
        preConfirm: () => {
            let terpilih = [];
            dataPesanan.forEach(item => {
                if (document.getElementById(item.id).checked) {
                    terpilih.push({
                        judul: item.judul,
                        jumlah: item.jumlah,
                        harga: item.harga
                    });
                }
            });

            if (terpilih.length === 0) {
                Swal.showValidationMessage('Pilih setidaknya satu item');
            }

            return terpilih;
        }
    }).then((result) => {
        if (result.isConfirmed && result.value.length > 0) {
            check_out(result.value);
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
                    timer: 1000,
                    timerProgressBar: true
                });
                window.location.replace("/orders");
            } else {
                Swal.fire({
                    toast: true,
                    position: 'top-start',
                    icon: 'error',
                    title: 'Ada yang salah',
                    showConfirmButton: false,
                    timer: 1000,
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
                <img src="${coverList[j]}" class="d-block w-100 card-book-img" alt="cover-${j}">
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
                <img src="${coverList[j]}" class="d-block w-100 detail-img" alt="cover-${j}">
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
                    value="${judul}" disabled>
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
                <button onclick="editing()" class="btn semibold btn-login mb-3">Perbarui</button>
                <a href="/adminpage"><button class="btn semibold btn-back ms-3">Kembali</button></a>
            </div>
        </div>
    </div>
    `;
    $('#editbuku').append(temp_html);
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
                            <img src="${coverList[j]}" class="d-block w-100 card-book-img1" alt="cover-${j}">
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
                            <img src="${coverList[0]}" class="d-block w-100 card-book-img1" alt="cover-0">
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
                            <img src="${coverList[j]}" class="d-block w-100 card-book-img1" alt="cover-${j}">
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
                        <img src="${coverList[0]}" class="d-block w-100 card-book-img1" alt="cover-0">
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
                    timer: 1000,
                    timerProgressBar: true
                });
                window.location.reload();
            }
        },
    });
}

// Page Regis Admin
function masukadmin() {
    let username = $('#inputUsername').val().trim();
    if (!username) {
        return Swal.fire({
            toast: true,
            position: 'top-start',
            icon: 'warning',
            title: 'Silahkan isi username anda',
            showConfirmButton: false,
            timer: 1000,
            timerProgressBar: true
        });
    }

    let password = $('#inputPassword').val().trim();
    if (password.length < 8) {
        return Swal.fire({
            toast: true,
            position: 'top-start',
            icon: 'error',
            title: 'Password minimal 8 karakter',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true
        });
    }


    let email = $('#inputEmail').val().trim();
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return Swal.fire({
            toast: true,
            position: 'top-start',
            icon: 'error',
            title: 'Format email tidak valid',
            showConfirmButton: false,
            timer: 1000,
            timerProgressBar: true
        });
    }

    let nomor = $('#inputNomor').val().trim();
    let nomorRegex = /^[0-9]{9,15}$/;

    if (!nomorRegex.test(nomor)) {
        return Swal.fire({
            toast: true,
            position: 'top-start',
            icon: 'error',
            title: 'Nomor handphone tidak valid (9-15 digit angka)',
            showConfirmButton: false,
            timer: 1500,
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
            timer: 1000,
            timerProgressBar: true
        });
    } else if (helpId.hasClass("fa-solid") && helpId.hasClass("fa-xmark")) {
        return Swal.fire({
            toast: true,
            position: 'top-start',
            icon: 'warning',
            title: 'Username sudah digunakan. Gunakan username lain.',
            showConfirmButton: false,
            timer: 1000,
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
                timer: 1000,
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
        <img src="${profile}" class="img-thumbnail gambar mt-3" alt="Profile">
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
    let username = $('#inputUsername').val().trim();
    if (!username) {
        return Swal.fire({
            toast: true,
            position: 'top-start',
            icon: 'warning',
            title: 'Silahkan isi username anda',
            showConfirmButton: false,
            timer: 1000,
            timerProgressBar: true
        });
    }

    let password = $('#inputPassword').val().trim();
    if (password.length < 8) {
        return Swal.fire({
            toast: true,
            position: 'top-start',
            icon: 'error',
            title: 'Password minimal 8 karakter',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true
        });
    }

    let email = $('#inputEmail').val().trim();
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return Swal.fire({
            toast: true,
            position: 'top-start',
            icon: 'error',
            title: 'Format email tidak valid',
            showConfirmButton: false,
            timer: 1000,
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
            timer: 1000,
            timerProgressBar: true
        });
    } else if (helpId.hasClass("fa-solid") && helpId.hasClass("fa-xmark")) {
        return Swal.fire({
            toast: true,
            position: 'top-start',
            icon: 'warning',
            title: 'Cek kembali ID anda..',
            showConfirmButton: false,
            timer: 1000,
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
                timer: 1000,
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

function postbook() {
    const judul = $('#judul').val().trim();
    const deskripsi = $('#deskripsi').val().trim();
    const harga = $('#harga').val().trim();
    const stok = $('#stok').val().trim();
    const kategori = $('#kategori').val();
    const gambarList = $("#gambar-buku").prop("files");

    const showToast = (msg) => {
        Swal.fire({
            toast: true,
            position: 'top-start',
            icon: 'warning',
            title: msg,
            showConfirmButton: false,
            timer: 1000,
            timerProgressBar: true
        });
    };

    if (!judul) return showToast('Silahkan isi nama barang');
    if (!deskripsi) return showToast('Silahkan isi deskripsi barang');
    if (!harga) return showToast('Silahkan isi harga barang');
    if (!stok) return showToast('Silahkan isi stok barang');
    if (!kategori) return showToast('Silahkan pilih kategori barang');
    if (gambarList.length === 0) return showToast('Silahkan input gambar barang');

    // Normalize judul ke slug URL (contoh: "Buku Tulis 123" => "buku-tulis-123")
    let url = judul
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')     // hapus karakter non-alfanumerik
        .replace(/\s+/g, '-')             // ganti spasi jadi -
        .replace(/-+/g, '-');             // hapus duplikat tanda -

    let form_data = new FormData();
    for (let i = 0; i < gambarList.length; i++) {
        form_data.append("gambar_give[]", gambarList[i]);
    }

    form_data.append("judul_give", judul);
    form_data.append("deskripsi_give", deskripsi);
    form_data.append("harga_give", harga);
    form_data.append("stok_give", stok);
    form_data.append("kategori_give", kategori);
    form_data.append("url_give", url);

    $.ajax({
        type: 'POST',
        url: '/tambahbuku',
        data: form_data,
        cache: false,
        contentType: false,
        processData: false,
        beforeSend: () => {
            Swal.fire({
                title: 'Menyimpan...',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => Swal.showLoading()
            });
        },
        success: function (response) {
            Swal.fire({
                toast: true,
                position: 'top-start',
                icon: 'success',
                title: response["msg"] || 'Barang berhasil ditambahkan!',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true
            });
            setTimeout(() => window.location.href = '/adminpage', 1600);
        },
        error: function () {
            Swal.fire({
                icon: 'error',
                title: 'Oops!',
                text: 'Terjadi kesalahan saat menyimpan barang.'
            });
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
    // const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day} ${month} ${year} | ${hours}:${minutes}`;
}

function showorder() {
    $.ajax({
        type: 'GET',
        url: '/showorder',
        success: function (response) {
            let rows = response['daftarorderan'];
            if (!rows || rows.length === 0) {
                $('#showoderan').html(`
                    <div class="text-center text-muted my-5 fade-in-animation">
                        <i class="fa-solid fa-box-open fa-3x mb-3"></i><br>
                        <h5>Belum ada orderan</h5>
                    </div>
                `);
                return;
            }

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
                let status = group[0].status.toLowerCase();

                if (status === 'pesanan selesai' || status === 'dibatalkan') {
                    continue;
                }

                let totalSemua = 0;
                let jumlahSemua = 0;
                let statusPembatalan = group[0].status_pembatalan;

                let itemHTML = group.map((item, idx) => {
                    let jumlah = parseInt(item.jumlah);
                    let harga = parseInt(item.harga);
                    totalSemua += harga;
                    jumlahSemua += jumlah;

                    let carouselId = `carousel-${id}-${idx}`;
                    let covers = item.AllCover || [];
                    let indicators = '', inner = '';

                    for (let i = 0; i < covers.length; i++) {
                        let activeClass = i === 0 ? 'active' : '';
                        indicators += `<button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${i}" class="${activeClass}" aria-current="${activeClass ? 'true' : 'false'}" aria-label="Slide ${i + 1}"></button>`;
                        inner += `<div class="carousel-item ${activeClass}"><img src="${covers[i]}" class="d-block w-100 rounded-3 img-ord" alt="Cover ${i + 1}"></div>`;
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
                                        <span class="${status === 'dibatalkan' ? 'text-danger' :
                            status === 'belum bayar' ? 'text-warning' :
                                status === 'sudah bayar' ? 'text-info' :
                                    status === 'menunggu pembayaran' ? 'text-primary' :
                                        status === 'terkirim' ? 'text-success' :
                                            status === 'pesanan selesai' ? 'text-muted' :
                                                'text-secondary'}">
                                            ${item.status}
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    `;
                }).join('');

                // Tombol Pembatalan
                let tombolPembatalan = '';
                if (status === 'sudah bayar') {
                    if (statusPembatalan === 'diajukan') {
                        tombolPembatalan = `<button id="btn-batal-${id}" class="btn btn-warning" type="button" onclick="batalkanPermintaanPembatalan('${id}')">🔁 Batalkan Pembatalan</button>`;
                    } else {
                        tombolPembatalan = `<button id="btn-batal-${id}" class="btn btn-outline-warning" type="button" onclick="batalkanPesanan('${id}')">❌ Batalkan Pesanan</button>`;
                    }
                } else if (status === 'terkirim') {
                    tombolPembatalan = `<button class="btn btn-outline-success" onclick="pesananSelesai('${id}')">✅ Pesanan Selesai</button>`;
                }

                // Tombol Aksi
                let tombolAksi = '';
                if (status === 'belum bayar') {
                    tombolAksi = `
                        <div class="d-flex justify-content-center gap-2 mt-3">
                            <button class="btn btn-outline-danger" type="button" onclick="cekVerifikasiWajah('${id}', '${waktu}')">Bayar</button>
                            <button class="btn btn-outline-secondary" type="button" onclick="hapusPesanan('${id}')">🗑️ Hapus Pesanan</button>
                        </div>
                    `;
                } else if (status === 'menunggu pembayaran') {
                    tombolAksi = `
                        <div class="d-flex justify-content-center gap-2 mt-3">
                            <button class="btn btn-outline-primary" type="button" onclick="lanjutkanPembayaran('${id}')">💳 Lanjutkan Pembayaran</button>
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
                    <div class="card shadow-lg p-4 rounded-4 mb-4 position-relative" id="order-card-${id}">
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

                if (status === 'belum bayar' || status === 'menunggu pembayaran') {
                    startCountdown(id, waktu);
                }
            }
        },
        error: function () {
            Swal.fire("Error", "Gagal mengambil data pesanan dari server", "error");
        }
    });
}

function cekVerifikasiWajah(orderid, tanggal) {
    $.ajax({
        type: "GET",
        url: "/api/verifikasi-wajah",
        success: function (response) {
            if (response["verifikasi_wajah"] === true) {
                // Sudah verifikasi, lanjut ke pembayaran
                verifikasiSebelumBayar(orderid, tanggal);
            } else {
                // Belum verifikasi, arahkan ke halaman profile
                Swal.fire({
                    icon: 'warning',
                    title: 'Verifikasi Wajah Diperlukan',
                    text: 'Silakan verifikasi wajah terlebih dahulu sebelum melakukan pembayaran.',
                    confirmButtonText: 'Ke Profil',
                    allowOutsideClick: false
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = "/profile";
                    }
                });
            }
        },
        error: function () {
            Swal.fire("Gagal", "Gagal memeriksa status verifikasi wajah", "error");
        }
    });
}

function pesananSelesai(orderid) {
    if (!orderid) {
        Swal.fire("Error", "Order ID tidak tersedia.", "error");
        return;
    }

    Swal.fire({
        title: "Konfirmasi",
        text: "Apakah Anda yakin pesanan ini sudah selesai?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya, selesai",
        cancelButtonText: "Batal"
    }).then((result) => {
        if (result.isConfirmed) {
            fetch('/pesanan-selesai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ orderid: orderid })
            })
                .then(res => {
                    if (!res.ok) {
                        throw new Error("Gagal menerima respon dari server");
                    }
                    return res.json();
                })
                .then(data => {
                    if (data.result === 'success') {
                        Swal.fire("Sukses", "Status pesanan telah diperbarui.", "success")
                            .then(() => showorder()); // Refresh setelah user klik OK
                    } else {
                        Swal.fire("Gagal", data.message || "Terjadi kesalahan.", "error");
                    }
                })
                .catch(err => {
                    Swal.fire("Error", err.message || "Gagal menghubungi server.", "error");
                });
        }
    });
}

function chatPenjual(orderid) {
    openChat(orderid); // Panggil fungsi buka popup chat
}

if (typeof loadChat === 'function') {
    setInterval(loadChat, 5000);
}

if (typeof loadAdminChat === 'function') {
    setInterval(loadAdminChat, 5000);
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

function pembayaran(orderid, tanggal) {
    let username = $.cookie('username');

    if (!username || !orderid || !tanggal) {
        alert("Data checkout tidak valid.");
        return;
    }

    // Format tanggal agar jadi "YYYY-MM-DD HH:mm:ss"
    const orderDate = new Date(tanggal);
    const pad = (n) => (n < 10 ? '0' + n : n);
    const formattedTanggal = `${orderDate.getFullYear()}-${pad(orderDate.getMonth() + 1)}-${pad(orderDate.getDate())} ${pad(orderDate.getHours())}:${pad(orderDate.getMinutes())}:${pad(orderDate.getSeconds())}`;

    $.ajax({
        type: 'POST',
        url: '/bayar',
        data: {
            order_id: orderid,
            tanggal_give: formattedTanggal
        },
        success: function (response) {
            if (response.result === 'success' && response.snap_token) {
                window.snap.pay(response.snap_token, {
                    onSuccess: function () {
                        Swal.fire({
                            toast: true,
                            position: 'top-start',
                            icon: 'success',
                            title: "Pembayaran berhasil!",
                            showConfirmButton: false,
                            timer: 1000,
                            timerProgressBar: true
                        });
                        showorder();
                    },
                    onPending: function () {
                        Swal.fire({
                            toast: true,
                            position: 'top-start',
                            icon: 'info',
                            title: "Menunggu pembayaran...",
                            showConfirmButton: false,
                            timer: 2000,
                            timerProgressBar: true
                        });
                    },
                    onError: function () {
                        Swal.fire({
                            toast: true,
                            position: 'top-start',
                            icon: 'error',
                            title: "Terjadi kesalahan dalam pembayaran.",
                            showConfirmButton: false,
                            timer: 2000,
                            timerProgressBar: true
                        });
                    },
                    onClose: function () {
                        alert('Kamu menutup popup pembayaran.');
                        Swal.fire({
                            toast: true,
                            position: 'top-start',
                            icon: 'warning',
                            title: "Kamu menutup popup pembayaran.",
                            showConfirmButton: false,
                            timer: 1000,
                            timerProgressBar: true
                        });
                        return showorder();
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

function lanjutkanPembayaran(orderId) {
    $.ajax({
        type: 'POST',
        url: '/get-snap-token',
        data: { order_id: orderId },
        success: function (response) {
            if (response.result === 'success') {
                snap.pay(response.snap_token, {
                    onSuccess: function (result) {
                        Swal.fire({
                            toast: true,
                            position: 'top-start',
                            icon: 'success',
                            title: "Pembayaran Berhasil",
                            showConfirmButton: false,
                            timer: 1000,
                            timerProgressBar: true
                        });
                        showorder();
                    },
                    onPending: function (result) {
                        Swal.fire({
                            toast: true,
                            position: 'top-start',
                            icon: 'info',
                            title: "Menunggu Pembayaran, Selesaikan transaksi Anda.",
                            showConfirmButton: false,
                            timer: 1000,
                            timerProgressBar: true
                        });
                    },
                    onError: function (result) {
                        Swal.fire({
                            toast: true,
                            position: 'top-start',
                            icon: 'error',
                            title: "Terjadi kesalahan saat pembayaran.",
                            showConfirmButton: false,
                            timer: 1000,
                            timerProgressBar: true
                        });
                    },
                    onClose: function () {
                        console.log("User menutup popup tanpa menyelesaikan pembayaran");
                    }
                });
            } else {
                Swal.fire("Gagal", response.message || "Gagal mendapatkan token pembayaran.", "error");
            }
        },
        error: function () {
            Swal.fire("Error", "Tidak bisa terhubung ke server.", "error");
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

            let pembatalanList = response['daftarpembatalan'] || [];
            let pembatalanSet = new Set(pembatalanList.map(p => p.order_id));

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
                        inner += `<div class="carousel-item ${activeClass}"><img src="${covers[i]}" class="d-block w-100 rounded-3 img-ord" alt="Cover ${i + 1}"></div>`;
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
                                        <span class="${status === 'belum bayar' ? 'text-danger' : (status === 'dibatalkan' ? 'text-danger' : 'text-success')}">${item.status}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    `;
                }).join('');

                // Tombol Aksi Admin
                let tombolAksi = '';
                if (status === 'sudah bayar') {
                    let tombolList = [];

                    if (!pembatalanSet.has(id)) {
                        tombolList.push(`<button class="btn btn-outline-success" onclick="kirimPesanan('${id}', '${username}')">📦 Kirim Pesanan</button>`);
                    }

                    if (pembatalanSet.has(id)) {
                        tombolList.push(`<button class="btn btn-outline-danger" onclick="konfirmasiPembatalan('${id}', '${username}')">❌ Konfirmasi Pembatalan</button>`);
                    }

                    tombolList.push(`<button class="btn btn-outline-info" onclick="chatUser('${id}', '${username}')">💬 Chat User</button>`);

                    tombolAksi = `
                        <div class="d-flex justify-content-center gap-2 mt-3">
                            ${tombolList.join('')}
                        </div>
                    `;
                } else {
                    tombolAksi = `
                        <div class="d-flex justify-content-center mt-3">
                            <button class="btn btn-outline-info" onclick="chatUser('${id}', '${username}')">💬 Chat User</button>
                        </div>
                    `;
                }

                // Label dibatalkan
                let badgeDibatalkan = '';
                if (status === 'dibatalkan') {
                    badgeDibatalkan = `
                        <div class="position-absolute top-0 end-0 mt-2 me-3">
                            <span class="badge bg-danger">❌ DIBATALKAN</span>
                        </div>
                    `;
                }

                let temp_html = `
                    <div class="card shadow-lg p-4 rounded-4 mb-4 position-relative" id="order-card-${id}">
                        ${badgeDibatalkan}
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
                const foto = user.profile_default ? `${user.profile_default}` : '/static/profil_default.jpg';
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
                location.reload();
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

function konfirmasiPembatalan(orderId, username) {
    Swal.fire({
        title: 'Konfirmasi Pembatalan',
        text: `Yakin ingin membatalkan pesanan ${orderId}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, batalkan',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch('/konfirmasi_pembatalan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ order_id: orderId, username: username })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.result === 'success') {
                        Swal.fire('Dibatalkan', 'Pesanan telah dibatalkan.', 'success');
                        showorderadmin(); // refresh daftar order
                    } else {
                        Swal.fire('Gagal', data.message || 'Terjadi kesalahan.', 'error');
                    }
                })
                .catch(err => {
                    Swal.fire('Error', 'Tidak dapat menghubungi server.', 'error');
                    console.error(err);
                });
        }
    });
}

function kirimPesanan(orderId, username) {
    Swal.fire({
        title: 'Kirim Pesanan?',
        text: `Pastikan pesanan ${orderId} atas nama ${username} sudah dikirim.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, kirim',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch('/kirim_pesanan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ order_id: orderId, username: username })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.result === 'success') {
                        Swal.fire('Terkirim', 'Status pesanan telah diubah menjadi Terkirim.', 'success');
                        showorderadmin(); // Refresh tampilan
                    } else {
                        Swal.fire('Gagal', data.message || 'Gagal mengirim pesanan.', 'error');
                    }
                })
                .catch(error => {
                    Swal.fire('Error', 'Terjadi kesalahan saat mengirim pesanan.', 'error');
                    console.error(error);
                });
        }
    });
}

function showorderDibatalkan() {
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

            let ditemukanDibatalkan = false;

            for (let [key, group] of sortedGroups) {
                let { order_id: id, tanggal: waktu } = group[0];
                let status = group[0].status.toLowerCase();

                if (status !== 'dibatalkan') continue;
                ditemukanDibatalkan = true;

                let totalSemua = 0;
                let jumlahSemua = 0;

                let itemHTML = group.map((item, idx) => {
                    let jumlah = parseInt(item.jumlah);
                    let harga = parseInt(item.harga);
                    totalSemua += harga;
                    jumlahSemua += jumlah;

                    let carouselId = `carousel-${id}-${idx}`;
                    let covers = item.AllCover || [];
                    let indicators = '', inner = '';

                    for (let i = 0; i < covers.length; i++) {
                        let activeClass = i === 0 ? 'active' : '';
                        indicators += `<button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${i}" class="${activeClass}" aria-current="${activeClass ? 'true' : 'false'}" aria-label="Slide ${i + 1}"></button>`;
                        inner += `<div class="carousel-item ${activeClass}"><img src="${covers[i]}" class="d-block w-100 rounded-3 img-ord" alt="Cover ${i + 1}"></div>`;
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
                                        <span class="text-danger">${item.status}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    `;
                }).join('');

                let tombolAksi = `
                    <div class="d-flex justify-content-center gap-2 mt-3">
                        <button class="btn btn-outline-secondary" type="button" onclick="chatPenjual('${id}')">💬 Chat Penjual</button>
                    </div>
                `;

                let labelTambahan = `<span class="position-absolute top-0 end-0 badge bg-danger m-3 rounded-pill">Dibatalkan</span>`;

                let temp_html = `
                    <div class="card shadow-lg p-4 rounded-4 mb-4 position-relative" id="order-card-${id}">
                        ${labelTambahan}
                        <h4 class="mb-3">${formatTanggal(waktu)}</h4>
                        ${itemHTML}
                        ${tombolAksi}
                    </div>
                `;

                $('#showoderan').append(temp_html);
            }

            if (!ditemukanDibatalkan) {
                $('#showoderan').html(`
                    <div class="text-center py-5">
                        <h4 class="text-muted">Tidak ada pesanan yang dibatalkan</h4>
                    </div>
                `);
            }
        },
        error: function () {
            Swal.fire("Error", "Gagal mengambil data pesanan dari server", "error");
        }
    });
}

function showorderSelesai() {
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

            let ditemukanSelesai = false;

            for (let [key, group] of sortedGroups) {
                let { order_id: id, tanggal: waktu } = group[0];
                let status = group[0].status.toLowerCase();

                if (status !== 'pesanan selesai') continue;
                ditemukanSelesai = true;

                let totalSemua = 0;
                let jumlahSemua = 0;

                let itemHTML = group.map((item, idx) => {
                    let jumlah = parseInt(item.jumlah);
                    let harga = parseInt(item.harga);

                    totalSemua += harga;
                    jumlahSemua += jumlah;

                    let carouselId = `carousel-${id}-${idx}`;
                    let covers = item.AllCover || [];
                    let indicators = '', inner = '';

                    for (let i = 0; i < covers.length; i++) {
                        let activeClass = i === 0 ? 'active' : '';
                        indicators += `<button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${i}" class="${activeClass}" aria-current="${activeClass ? 'true' : 'false'}" aria-label="Slide ${i + 1}"></button>`;
                        inner += `<div class="carousel-item ${activeClass}"><img src="${covers[i]}" class="d-block w-100 rounded-3 img-ord" alt="Cover ${i + 1}"></div>`;
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
                                        <span class="text-success">${item.status}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    `;
                }).join('');

                let tombolAksi = `
                    <div class="d-flex justify-content-center gap-2 mt-3">
                        <button class="btn btn-outline-secondary" type="button" onclick="chatPenjual('${id}')">💬 Chat Penjual</button>
                    </div>
                `;

                let labelTambahan = `<span class="position-absolute top-0 end-0 badge bg-success m-3 rounded-pill">Pesanan Selesai</span>`;

                let temp_html = `
                    <div class="card shadow-lg p-4 rounded-4 mb-4 position-relative" id="order-card-${id}">
                        ${labelTambahan}
                        <h4 class="mb-3">${formatTanggal(waktu)}</h4>
                        ${itemHTML}
                        ${tombolAksi}
                    </div>
                `;

                $('#showoderan').append(temp_html);
            }

            if (!ditemukanSelesai) {
                $('#showoderan').html(`
                    <div class="text-center py-5">
                        <h4 class="text-muted">Belum ada pesanan selesai</h4>
                    </div>
                `);
            }
        },
        error: function () {
            Swal.fire("Error", "Gagal mengambil data pesanan dari server", "error");
        }
    });
}