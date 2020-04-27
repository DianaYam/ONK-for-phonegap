/*-----------------------------------------------------------------------------------

    Template Name: Notika - Notika Admin Template 
    Template URI: 
    Description: Notika Admin Template is a responsive admin template based on the famous Bootstrap framework it's easy to edit and customize by documentation.
    Author: lucidtemplate
    Author URI: 
    Version: 1.0

-----------------------------------------------------------------------------------
    
    CSS INDEX
    ===================
    
    1. Универсальные методы
    2. Профиль пользователя
    3. Жалобы
    4. Мои жалобы
    5. Пользователи
    6. Настройки
    7. Вход, выход, регистрация
    8. Страница "Запросы"
    9. Меню администратора: пользователи
    10. Меню администратора: жалобы
    11. Меню администратора: учреждения
    12. Меню администратора: категории 
    13. Меню администратора: статусы 



-----------------------------------------------------------------------------------*/

/*----------------------------------------*/
/*  1.  Theme default CSS
/*----------------------------------------*/
// var app = {
//     // Application Constructor
//     initialize: function() {
//         this.bindEvents();
//     },
//     // Bind Event Listeners
//     //
//     // Bind any events that are required on startup. Common events are:
//     // 'load', 'deviceready', 'offline', and 'online'.
//     bindEvents: function() {
//         document.addEventListener('deviceready', this.onDeviceReady, false);
//     },
//     // deviceready Event Handler
//     //
//     // The scope of 'this' is the event. In order to call the 'receivedEvent'
//     // function, we must explicitly call 'app.receivedEvent(...);'
//     onDeviceReady: function() {
//         app.receivedEvent('deviceready');
//     },
//     // Update DOM on a Received Event
//     receivedEvent: function(id) {
//         var parentElement = document.getElementById(id);
//         var listeningElement = parentElement.querySelector('.listening');
//         var receivedElement = parentElement.querySelector('.received');

//         listeningElement.setAttribute('style', 'display:none;');
//         receivedElement.setAttribute('style', 'display:block;');

//         console.log('Received Event: ' + id);
//     }
// };

// function openNav() {
//     document.getElementById("mySidenav").style.width = "250px";
// }

// function closeNav() {
//     document.getElementById("mySidenav").style.width = "0";
// }

// function openModal(){
//     var modal = document.getElementById('modalComplaints');

//     if (modal) {modal.style.display = "block";}
// }

// function closeModal(){
//     var modal = document.getElementById('modalComplaints');

//     if (modal) {modal.style.display = "none";}
// }

/*----------------------------------------*/
/*  1.  Универсальные методы
/*----------------------------------------*/

/*------------ Главные элементы-----------*/
const elements = {
    alertModal: $('#alertModal'),
    deleteComplaintModal: $('#deleteComplaintModal'),
    paginationBtn: $('.results__btn'),
    complaintsContainer: $('#complaintsContainer'),
    mentorsContainer: $('#mentorSelect'),
    statusContainer: $('#statusSelect'),
    penitentiariesContainer: $('#penitentiariesSelect'),
    messagesContainer: $('#messagesContainer')

}

var rowsOnPage = 10;
// storage for user data on client
var myStorage = window.localStorage;
myStorage.userPage = 0;
myStorage.fireFunc = false;
//myStorage.userName = '';
//myStorage.userID = 0;
//myStorage.userRole = 0;
var errorDate = false;

/**
 *
 * Выполнить ajax-запрос
 * 
 * @param  {string}
 * @param  {callback function}
 * @param  {callback handler}
 * @return {null}
 */
function ajaxCall(file, callback, json) {
    if (!json) {
        var obj = {};
        obj.nodata = true;
        json = JSON.stringify(obj);
    }
    $.ajax({
        url: window.location.origin + '/api/v0.01/' + '?cmd=' + file,
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(json),
        type: 'POST',
        success: function(data, textStatus, jqXHR) {
            if (typeof data == "object" && data.error) {
                var code = (data.message != null) ? data.message.toString() : "0";
                var arr = code.split('-');
                code = parseInt(arr.shift().trim());
                if (code == 1) {
                    myStorage.userName = '';
                    myStorage.userID = 0;
                    myStorage.userRole = 0;
                    location.href = window.location.origin + '/login.html'
                }
            }
            (data && data.error != true) ? callback(data, 1): callback(data, -1);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            var data = {};
            data.error = true;
            data.message = 'Ответ сервера: ' + errorThrown;
            callback(data, -1);
        }
    });
}

/**
 *
 * Добавить блок
 * 
 * @param {selector}
 * @param {string}
 */
function addBlock(parentElement, templateName) {
    if (parentElement && parentElement.length > 0) {
        $(parentElement).html(' ');
        $(parentElement).append(templateName);
    } else {
        elements.alertModal.modal('show');
    }
}

/**
 *
 * Проверка результата выполенения ajax-запроса
 * видимо вторая версия, или под новый формат данных
 * 
 * @param  {data}
 * @return {bool}
 */
function checkResult2(data) {
    if (typeof data == "object" && data.error) {
        var code = (data.message != null) ? data.message.toString() : "0";
        var arr = code.split('-');
        code = parseInt(arr.shift().trim());
        if (code == 1) {
            $('#gotError .modal-footer button').click(function() {
                myStorage.userName = '';
                myStorage.userID = 0;
                myStorage.userRole = 0;
                location.href = window.location.origin + '/login.html'
            });
        }
        $('#gotError .modal-body p').html(data.message);
        if (errorDate === false) { errorDate = new Date(); } else {
            var now = new Date();
            var diff = (now.getTime() - errorDate.getTime()) / 1000;
            if (diff > 10) {
                errorDate = false;
                return checkResult2(data);
            }
            // console.log(data.message);
            return false;
        }
        $('#gotError').modal('show');
        return false;
    } else {
        return true;
    }
}

/**
 *
 * Проверка результата выполенения ajax-запроса
 * старый формат данных? 
 * 
 * @param  {data}
 * @return {bool}
 */
function checkResult(data) {
    if (typeof data == "object" && data.error) {
        $('#alertModal .modal-body p').html(data.message);
        $('#alertModal').modal('show');
    } else {
        $('#successModal').modal('show');
        if (typeof myStorage.fireFunc == "string") {
            eval(myStorage.fireFunc);
            myStorage.fireFunc = false;
        }
    }
}

/**
 *
 * Создание кнопки для навигации по страницам
 * 
 * @param  {num}
 * @param  {str}
 * @return {null}
 */
const createButton = (page, type) => `
    <button class="btn btn-default btn-sm" data-goto=${type === 'prev' ? page - 1 : page + 1}><i class="notika-icon notika-${type}-arrow"></i></button>
`;

/**
 *
 * Визуализация кнопки (кнопок?) постраничной навигации
 * 
 * @param  {num}
 * @param  {num}
 * @param  {num}
 * @return {null}
 */
const renderButton = (page, numResult, resPerPage) => {
    // pages = 80 / 8 = 10 
    const pages = Math.ceil(numResult / resPerPage);

    let button;
    // 1. Номер страницы = 1; страниц больше 1
    if (page === 1 && pages > 1) {
        button = createButton(page, 'right');
        //  2. Номер страницы меньше числа страниц
    } else if (page < pages) {
        button = `
        ${createButton(page, 'right')}
        ${createButton(page, 'left')}
        `;

    } else if (page === pages && pages > 1) {
        button = createButton(page, 'left');
    } else {
        button = "";
    }
    clearContainer(elements.paginationBtn);
    elements.paginationBtn.append(button);
}

/**
 * Общая обертка для работы с кнопками потраничной навигации
 * 
 * @param  {Number}
 * @param  {Number}
 * @param  {Function}
 * @param  {callback function}
 * @return {null}
 */
const render = (page = 1, resPerPage = 9, callback, file) => {
    ajaxCall(file, function(items) {
        const start = (page - 1) * resPerPage;
        const end = page * resPerPage;

        items.slice(start, end).forEach(callback);
        renderButton(page, items.length, resPerPage);
    });
}

function clearContainer(element) {
    element.html("");
}

/*----------------------------------------*/
/*  2.  Профиль пользователя
/*----------------------------------------*/

/**
 *
 * Получение (и визуализация ?) данных пользователя
 * 
 * @return {bool}
 */
function getUserData() {
    var outdata = {};
    outdata.id = myStorage.userID;
    // обращаемся к api с параметром cmd=user
    ajaxCall("user", function(data) {
        if (checkResult2(data) == false) { return false; }

        // если не вылетеле на предыдущей строке проверки результата то
        // визуализируем данные пользователя        
        var block = $('#userDataContainer'),
            template = '<div class="contact-list"><div class="contact-win">';

        if (data[0].img != "") {
            // console.log('data[0].img');
            // console.log(data[0].img);
            template += '<div class="contact-img"><img src="' + data[0].img + '" alt="' + data[0].username + '" /></div>';
        } else {
            template += '<div class="contact-img"><img src="./img/post/user.png" alt="' + data[0].username + '" /></div>';
        }

        template += '<div class="conct-sc-ic">';


        if (data[0].vk != '') {
            template += '<a class="btn" href="' + data[0].vk + '" target="_blank"><i class="fa fa-vk"></i></a>';
        }
        if (data[0].email != '') {
            template += '<a class="btn" href="mailto:' + data[0].email + '" target="_top"><i class="fa fa-envelope"></i></a>';
        }

        if (data[0].phone != '') {
            template += '<a class="btn" href="tel:' + data[0].phone + '"><i class="fa fa-phone"></i></a>';
        }

        template += '</div></div><div class="contact-ctn"><div class="contact-ad-hd"><a href=./profile.html?id=' + data[0].id + '><h2>' + data[0].username + '</h2></a><p class="ctn-ads">' + data[0].location + '</p></div>';

        if (data[0].about != '') {
            template += '<p>' + data[0].about + '</p>';
        }

        template += '</div><div class="social-st-list"><div class="social-sn"><h2>Обращений:</h2><p>' + data[0].complaints + '</p></div><div class="social-sn"><h2>Комментариев:</h2><p>' + data[0].requests + '</p></div></div></div></div>';

        addBlock(block, template);
    }, outdata);
}

function getUserDataWhereID(id) {
    var outdata = {};
    outdata.id = id;
    // обращаемся к api с параметром cmd=user
    ajaxCall("user", function(data) {
        if (checkResult2(data) == false) { return false; }

        // если не вылетеле на предыдущей строке проверки результата то
        // визуализируем данные пользователя        
        var block = $('#userDataContainer'),
            template = '<div class="contact-list"><div class="contact-win">';

        if (data[0].img != "") {
            template += '<div class="contact-img"><img src="' + data[0].img + '" alt="' + data[0].username + '" /></div>';
        } else {
            template += '<div class="contact-img"><img src="./img/post/user.png" alt="' + data[0].username + '" /></div>';
        }

        template += '<div class="conct-sc-ic">';


        if (data[0].vk != '') {
            template += '<a class="btn" href="' + data[0].vk + '" target="_blank"><i class="fa fa-vk"></i></a>';
        }
        if (data[0].email != '') {
            template += '<a class="btn" href="mailto:' + data[0].email + '" target="_top"><i class="fa fa-envelope"></i></a>';
        }

        if (data[0].phone != '') {
            template += '<a class="btn" href="tel:' + data[0].phone + '"><i class="fa fa-phone"></i></a>';
        }

        template += '</div></div><div class="contact-ctn"><div class="contact-ad-hd"><h2>' + data[0].username + '</h2><p class="ctn-ads">' + data[0].location + '</p></div>';

        if (data[0].about != '') {
            template += '<p>' + data[0].about + '</p>';
        }

        template += '</div><div class="social-st-list"><div class="social-sn"><h2>Обращений:</h2><p>' + data[0].complaints + '</p></div><div class="social-sn"><h2>Комментариев:</h2><p>' + data[0].requests + '</p></div></div></div></div>';

        addBlock(block, template);
    }, outdata);
}

/**
 *
 * Статистика пользователя
 * 
 * @return {bool}
 */
function getUserStatistics() {
    var outdata = {};
    outdata.id = myStorage.userID;
    // обращаемся к api с параметром cmd=user
    ajaxCall("user", function(text) {
        var data = text; //JSON.parse(text); 
        if (checkResult2(data) == false) { return false; }

        var block = $('#userStatisticsContainer');

        var template = '<div class="col-lg-3 col-md-6 col-sm-6 col-xs-12"><div class="wb-traffic-inner notika-shadow sm-res-mg-t-30 tb-res-mg-t-30"><div class="website-traffic-ctn"><h2><span class="counter">' + data[0].complaintsall + '</span></h2><p>Обращений</p></div><div class="sparkline-bar-stats1">' + data[0].complaints_data + '</div></div></div><div class="col-lg-3 col-md-6 col-sm-6 col-xs-12"><div class="wb-traffic-inner notika-shadow sm-res-mg-t-30 tb-res-mg-t-30"><div class="website-traffic-ctn"><h2><span class="counter">' + data[0].requestsall + '</span></h2><p>Комментариев</p></div><div class="sparkline-bar-stats2">' + data[0].requests_data + '</div></div></div><div class="col-lg-3 col-md-6 col-sm-6 col-xs-12"><div class="wb-traffic-inner notika-shadow sm-res-mg-t-30 tb-res-mg-t-30 dk-res-mg-t-30"><div class="website-traffic-ctn"><h2><span class="counter">' + data[0].penitentiaries + '</span></h2><p>Учреждений</p></div><div class="sparkline-bar-stats3">' + data[0].penitentiaries_data + '</div></div></div><div class="col-lg-3 col-md-6 col-sm-6 col-xs-12"><div class="wb-traffic-inner notika-shadow sm-res-mg-t-30 tb-res-mg-t-30 dk-res-mg-t-30"><div class="website-traffic-ctn"><h2><span class="counter">' + data[0].current + '</span></h2><p>В работе</p></div><div class="sparkline-bar-stats4">' + data[0].current_data + '</div></div>';

        addBlock(block, template);
    }, outdata);
}

function getUserStatisticsWhereID(id) {
    // console.log(id);
    var outdata = {};
    outdata.id = id;

    ajaxCall('user', function(text) {
        var data = text;
        // console.log(data);
        if (checkResult2(data) == false) { return false; }

        var block = $("#userStatisticsContainer");
        var template = '<div class="col-lg-3 col-md-6 col-sm-6 col-xs-12"><div class="wb-traffic-inner notika-shadow sm-res-mg-t-30 tb-res-mg-t-30"><div class="website-traffic-ctn"><h2><span class="counter">' + data[0].complaintsall + '</span></h2><p>Обращений</p></div><div class="sparkline-bar-stats1">' + data[0].complaints_data + '</div></div></div><div class="col-lg-3 col-md-6 col-sm-6 col-xs-12"><div class="wb-traffic-inner notika-shadow sm-res-mg-t-30 tb-res-mg-t-30"><div class="website-traffic-ctn"><h2><span class="counter">' + data[0].requestsall + '</span></h2><p>Комментариев</p></div><div class="sparkline-bar-stats2">' + data[0].requests_data + '</div></div></div><div class="col-lg-3 col-md-6 col-sm-6 col-xs-12"><div class="wb-traffic-inner notika-shadow sm-res-mg-t-30 tb-res-mg-t-30 dk-res-mg-t-30"><div class="website-traffic-ctn"><h2><span class="counter">' + data[0].penitentiaries + '</span></h2><p>Учреждений</p></div><div class="sparkline-bar-stats3">' + data[0].penitentiaries_data + '</div></div></div><div class="col-lg-3 col-md-6 col-sm-6 col-xs-12"><div class="wb-traffic-inner notika-shadow sm-res-mg-t-30 tb-res-mg-t-30 dk-res-mg-t-30"><div class="website-traffic-ctn"><h2><span class="counter">' + data[0].current + '</span></h2><p>В работе</p></div><div class="sparkline-bar-stats4">' + data[0].current_data + '</div></div>';

        addBlock(block, template);

    }, outdata);
}

/**
 *
 * Получаем сообщения 
 * что за сообщения? сообщения пользователя или сообщения пользователей (комментарии)?
 * 
 * @param  {num}
 * @return {bool}
 */
function getLastMessages(number) {
    var outdata = {};
    outdata.limit = '3';
    ajaxCall("messages", function(data) {
        if (checkResult2(data) == false) { return false; }
        // console.log(data);
        var block = $('#userLastMessagesContainer');

        var template = '<div class="recent-post-wrapper notika-shadow sm-res-mg-t-30"><div class="recent-post-ctn"><div class="recent-post-title"><h2>Последние сообщения</h2></div></div><div class="recent-post-items">';

        for (var i = 0; i < number; i++) {
            // console.log(data[i].id);
            template += '<div class="recent-post-signle"><a href="profile.html?id=' + data[i].id + '"><div class="recent-post-flex"><div class="recent-post-img"><img src="' + data[i].userphoto + '" alt="' + data[i].username + '" /></div><div class="recent-post-it-ctn"><h2>' + data[i].username + '</h2><p>' + data[i].messagecontent + '</p></div> </div></a></div>';
        }

        template += '</div></div>';

        addBlock(block, template);
    });
}

function getAllMessages() {
    ajaxCall("all_messages", function(data) {
        console.log(data);
    });
}

function getMessagesWhereID(id) {
    ajaxCall("all_messages", function(data) {
        var block = $('#userLastMessagesContainer');
        var template = '<div class="recent-post-wrapper notika-shadow sm-res-mg-t-30"><div class="recent-post-ctn"><div class="recent-post-title"><h2>Последние сообщения</h2></div></div><div class="recent-post-items">';
        for (var i = 0; i < data.length; i++) {
            if (data[i].user_id == id) {
                console.log(data[i]);
                var username = $(".contact-ad-hd > h2").text();
                console.log(username);
                template += '<div class="recent-post-signle"><a href="profile.html?id=' + data[i].user_id + '"><div class="recent-post-flex"><div class="recent-post-img"><img src="./avatars/' + id + '.png" alt="' + username + '" /></div><div class="recent-post-it-ctn"><h2>' + username + '</h2><p>' + data[i].text + '</p></div> </div></a></div>';
            }
        }
        template += '</div></div>';
        addBlock(block, template);
    });
}

function getLimitMessagesWhereID(id, limit) {
    ajaxCall("all_messages", function(data) {
        var block = $('#userLastMessagesContainer');
        var template = '<div class="recent-post-wrapper notika-shadow sm-res-mg-t-30"><div class="recent-post-ctn"><div class="recent-post-title"><h2>Последние сообщения</h2></div></div><div class="recent-post-items">';
        var count = 0;
        for (var i = 0; i < data.length; i++) {
            if (limit <= count) {
                break;
            }
            if (data[i].user_id == id) {
                console.log(data[i]);
                var username = $(".contact-ad-hd > h2").text();
                console.log(username);
                console.log(data[i]);
                template += '<div class="recent-post-signle"><a href="edit-complaint.html?id=' + data[i].complaint_id + '"><div class="recent-post-flex"><div class="recent-post-img"><img src="./avatars/' + id + '.png" alt="' + username + '" /></div><div class="recent-post-it-ctn"><h2>' + username + '</h2><p>' + data[i].text + '</p></div> </div></a></div>';
                count = count + 1;
            }
        }
        template += '</div></div>';
        addBlock(block, template);
        // $('img').each(function(){$(this).css('width', '60px'); $(this).css('height', '60px')});
    });
}
/*----------------------------------------*/
/*  3.  Жалобы
/*----------------------------------------*/
/**
 * Без доступа к интерфейсу вообще не понятно что эта функция делает
 * видимо что-то меняет. Автора жалобы? Или того кто назначен на работу с ней?
 */
function EditComplaintsModal() {
    // var selection = $('.i-checks');
    var selection = $('input[type=radio]:checked').attr('id');
    console.log(selection);
    window.location.href = './edit-complaint.html?id=' + selection;

    // Можно ли здесь одновременно поменять владельца у нескольких или нет?
    // for (var i = 0; i < selection.length; i++) {
    //     var id = selection.attr('id');
    //     window.location.href = './edit-complaint.html?id='+id;
    //     break;
    // }
}

/**
 *
 * Тут видимо редактируем статус жалобы
 * 
 * @return {null}
 */
function editstatusSelect() {
    var data = {};
    data.method = 'update';
    data.setfields = {};
    data.setfields.statusid = $('#statusSelect').val();
    if ($.urlParam('id')) {
        data.id = parseInt($.urlParam('id'));
    }
    ajaxCall("compalintsedit", null, data);
}

/**
 *
 * Редактируем жалобу (жалобы?) id передается один, имя метода говорит о том что их несколько
 * 
 * @param  {num}
 * @return {null}
 */
function editComplaints(id) {

    var data = {};
    data.setfields = {};
    data.setfields.applicant = $('#applicantName').val();
    data.setfields.gender = $('#applicantGender').val();
    data.setfields.dataofbirth = $('#applicantDateOfBirth').val();
    data.setfields.type = $('#applicationType').val();
    data.setfields.penitentiary = $('#applicantPenitentiary').val();
    data.setfields.text = $('#applicationText').val();
    data.setfields.mentor = ' ';
    data.setfields.mentorid = $('#mentorSelect').val();
    data.setfields.statusid = $('#statusSelect').val();

    if (id == -1) {
        data.method = 'insert';
    } else {
        data.method = 'update';
        data.id = id;
    }

    myStorage.fireFunc = 'window.location.href = "./complaints.html"';

    ajaxCall("compalintsedit", checkResult, data);
}

/**
 *
 * Походу дела фильтры для отображения жалоб по определенным критериям
 * 
 * @param {data(?)}
 */
function setComplaintFilters(data) {
    var mentors = '<option value="0">Все</option>';
    var statuses = '<option value="0">Все</option>';
    var uchs = '<option value="0">Все</option>';
    for (i = 0; i < data.users.length; i++) {
        mentors = mentors + '<option value="' + data.users[i].id + '">' + data.users[i].username + '</option>';
    }
    for (i = 0; i < data.statuses.length; i++) {
        statuses = statuses + '<option value="' + data.statuses[i].id + '">' + data.statuses[i].name + '</option>';
    }
    for (i = 0; i < data.uchs.length; i++) {
        uchs = uchs + '<option value="' + data.uchs[i].id + '">' + data.uchs[i].name + ' - ' + data.uchs[i].groupname + '</option>';
    }
    $('#mentorSelect').empty().append(mentors).selectpicker('refresh');
    $('#statusSelect').empty().append(statuses).selectpicker('refresh');
    $('#penitentiariesSelect').empty().append(uchs).selectpicker('refresh');
}

function delDocAgree(id) {
    $('#deleteDocModal').modal('hide');

    var data = {};
    data.id = id;

    //myStorage.fireFunc = 'document.location.reload();';

    var cvl = $('#linkContainerDesc').attr('cnt') - 1;
    if (cvl < 0) { cvl = 0; }
    var vl = 'нет вложений';
    if (cvl == 1) { vl = '1 вложение'; }
    if (cvl > 1 && cvl < 5) { vl = cvl + ' вложения'; }
    if (cvl >= 5) { vl = cvl + ' вложений'; }

    $('#linkContainerDesc').attr('cnt', cvl);
    $('#linkContainerDesc').html('<span><i class="notika-icon notika-paperclip"></i> ' + vl + ' <i class="notika-icon notika-arrow-right atc-sign"></i></span>');

    myStorage.fireFunc = '$("#doclink' + id + '").remove();';
    // переписать, когда будут данные
    ajaxCall("deletedoc", checkResult, data);


}

function delDoc(id, name) {
    $('#docNameDel').html(name);
    $('#deleteDocModal #docDelAgree').attr('onclick', 'delDocAgree(' + id + '); return false;');
    $('#deleteDocModal').modal('show');
}

function getComplaintsEditingWindow() {
    var outdata = {};
    if ($.urlParam('id')) {
        outdata.cid = parseInt($.urlParam('id'));
    } else { outdata.cid = -1; }

    ajaxCall("complaints", function(data) {
        var types = '',
            uchs = '<option value="0" disabled selected>--</option>';
        for (i = 0; i < data.types.length; i++) {
            var sel = '';
            if (data.rows.length > 0 && data.types[i].id == data.rows[0].typeid) { sel = ' selected'; }
            types = types + '<option value="' + data.types[i].id + '"' + sel + '>' + data.types[i].name + '</option>';
        }
        $('#applicationType').empty().append(types).selectpicker('refresh');

        var grp = '';
        for (i = 0; i < data.uchs.length; i++) {
            if (grp != data.uchs[i].groupname) {
                if (grp != '') { uchs = uchs + '</optgroup>'; }
                grp = data.uchs[i].groupname;
                uchs = uchs + '<optgroup label="' + data.uchs[i].groupname + '">';
            }
            var sel = '';
            if (data.rows.length > 0 && data.uchs[i].id == data.rows[0].uchid) { sel = ' selected'; }
            uchs = uchs + '<option value="' + data.uchs[i].id + '"' + sel + '>' + data.uchs[i].name + '</option>';
        }
        $('#applicantPenitentiary').empty().append(uchs).selectpicker('refresh');

        var statuses = '';
        for (i = 0; i < data.statuses.length; i++) {
            var sel = '';
            if (data.rows.length > 0 && data.statuses[i].id == data.rows[0].statusid) { sel = ' selected'; }
            statuses = statuses + '<option value="' + data.statuses[i].id + '"' + sel + '>' + data.statuses[i].name + '</option>';
        }

        var mentors = '';
        for (i = 0; i < data.users.length; i++) {
            var sel = '';
            if (data.rows.length > 0 && data.users[i].id == data.rows[0].userid) { sel = ' selected'; }
            mentors = mentors + '<option value="' + data.users[i].id + '"' + sel + '>' + data.users[i].username + '</option>';
        }

        $('#statusSelect').empty().append(statuses).selectpicker('refresh');
        $('#mentorSelect').empty().append(mentors).selectpicker('refresh');

        if (data.rows.length > 0) {
            $('#applicantGender option').removeAttr("selected");
            $('#applicantGender option').filter(function() { return $(this).html() == data.rows[0].gender; }).attr("selected", true);
            $('#applicantGender').selectpicker('refresh');
            $('#applicationText').html(data.rows[0].content);
            $('#applicantDateOfBirth').val(data.rows[0].applicantDateOfBirth);
            $('#applicantName').val(data.rows[0].applicant);
            $('#demo1-upload').attr('action', window.location.origin + '/api/v0.01/?cmd=uploaddoc&id=' + data.rows[0].id + '');
            $('#saveBtn').attr('onclick', 'editComplaints(' + data.rows[0].id + '); return false;');

            var cvl = data.rows[0].links.length;
            var vl = 'нет вложений';
            if (cvl == 1) { vl = '1 вложение'; }
            if (cvl > 1 && cvl < 5) { vl = cvl + ' вложения'; }
            if (cvl >= 5) { vl = cvl + ' вложений'; }

            $('#linkContainerDesc').attr('cnt', cvl);
            $('#linkContainerDesc').html('<span><i class="notika-icon notika-paperclip"></i> ' + vl + ' <i class="notika-icon notika-arrow-right atc-sign"></i></span>');
            var al = '';
            for (i = 0; i < data.rows[0].links.length; i++) {
                al = al + '<a id="doclink' + data.rows[0].links[i].id + '" class="btn dw-al-ft" target="_blank" href="' + data.rows[0].links[i].url + '">' + data.rows[0].links[i].name + ' <i class="notika-icon notika-file"></i>&nbsp;&nbsp;<i onclick="delDoc(' + data.rows[0].links[i].id + ',\'' + data.rows[0].links[i].name + '\'); return false;" class="notika-icon red-icon-notika waves-effect notika-close"></i></a>  ';
            }
            $('#linkContainer').html(al);

        }

    }, outdata);
}

function getAllDocs() {
    ajaxCall('all_docs', function(data) {
        console.log(data);
    });
}

// function getDocsWhereID(id) {
//     ajaxCall('all_docs', function(data){
//         for (var i=0; i < data.length; i++) {
//             if (data[i].complaint_id == id ) {
//                 console.log(data[i].name)
//                 console.log(data[i]);
//             }
//         }
//     });
// }

function getAllComments() {
    ajaxCall('all_comments', function(data) {
        console.log(data);
    });
}

function getCommentsWhereComplaintID(id) {
    console.log(id);
    ajaxCall('all_comments', function(data) {
        console.log(data);
        var block = $('#commentsArea');
        var template = '<div class="recent-post-wrapper notika-shadow sm-res-mg-t-30"><div class="recent-post-ctn"><div class="recent-post-title"><h2>Последние сообщения</h2></div></div><div class="recent-post-items"></div></div>';
        block.html(template);
        var mblock = $('.recent-post-items');
        var messages = "";
        for (var i = 0; i < data.length; i++) {
            if (data[i].complaint_id == id) {
                console.log(data[i].fio);
                var message = '<div class="recent-post-signle"><a href="profile.html?id=' + data[i].user_id + '"><div class="recent-post-flex"><div class="recent-post-img"><img src="./avatars/' + data[i].user_id + '.png" alt="' + data[i].fio + '" /></div><div class="recent-post-it-ctn"><h2>' + data[i].fio + '</h2><p>' + data[i].text + '</p></div> </div></a></div>';
                console.log(message);
                messages += message;
            }
        }
        mblock.html(messages);
    });
}

function getComplaints() {
    var outdata = {};
    outdata.limit = (myStorage.userPage * rowsOnPage) + ', ' + rowsOnPage;
    outdata.mentor = $('#mentorSelect').val();
    outdata.status = $('#statusSelect').val();
    outdata.uch = $('#penitentiariesSelect').val();

    if ($.urlParam('id')) {
        outdata.cid = parseInt($.urlParam('id'));
    }

    if (typeof window.isMy != 'undefined' && window.isMy) {
        outdata.isMy = true;
    }

    ajaxCall("complaints", function(text) {
        var data = text,
            template = '',
            block = $('#complaintsContainer');

        if ($.urlParam('id')) {
            if (data.rows.length < 1) { return false; }
            var statuses = '';
            for (i = 0; i < data.statuses.length; i++) {
                var sel = '';
                if (data.rows[0].statusid == data.statuses[i].id) { sel = ' selected'; }
                statuses = statuses + '<option value="' + data.statuses[i].id + '"' + sel + '>' + data.statuses[i].name + '</option>';
            }
            $('#statusSelect').empty().append(statuses).selectpicker('refresh');

            $('#aplicantionNumber').html(data.rows[0].id);
            $('#aplicantName').html(data.rows[0].applicant);
            $('#aplicantDateOfBirth').html(data.rows[0].applicantDateOfBirth);
            $('#aplicantGender').html(data.rows[0].gender);
            $('#aplicantPenitentiary').html(data.rows[0].penitentiary);
            $('#aplicationType').html(data.rows[0].type);
            $('#aplicationMentor').html(data.rows[0].username);
            $('#aplicationContent').html(data.rows[0].content);
            $('#deleteComplaintsUserBtn').attr('onclick', 'DeleteComplaintsModal(' + data.rows[0].id + '); return false;');
            $('#demo1-upload').attr('action', window.location.origin + '/api/v0.01/?cmd=uploaddoc&id=' + data.rows[0].id + '');

            var cvl = data.rows[0].links.length;
            var vl = 'нет вложений';
            if (cvl == 1) { vl = '1 вложение'; }
            if (cvl > 1 && cvl < 5) { vl = cvl + ' вложения'; }
            if (cvl >= 5) { vl = cvl + ' вложений'; }

            $('#linkContainerDesc').html('<span><i class="notika-icon notika-paperclip"></i> ' + vl + ' <i class="notika-icon notika-arrow-right atc-sign"></i></span>');
            var al = '';
            for (i = 0; i < data.rows[0].links.length; i++) {
                al = al + '<a class="btn dw-al-ft" target="_blank" href="' + data.rows[0].links[i].url + '">' + data.rows[0].links[i].name + ' <i class="notika-icon notika-file"></i>&nbsp;&nbsp;<i onclick="delDoc(' + data.rows[0].links[i].id + ',\'' + data.rows[0].links[i].name + '\'); return false;" class="notika-icon red-icon-notika waves-effect notika-close"></i></a>  ';
            }
            $('#linkContainer').html(al);

            return false;
        }

        block.html('');

        if (data.rows.length < 1 && myStorage.userPage > 0) {
            myStorage.userPage = parseInt(myStorage.userPage) - 1;
            if (myStorage.userPage < 0) { myStorage.userPage = 0; }
            getComplaints();
        }

        for (i = 0; i < data.rows.length; i++) {
            template += '<tr><td class=""><label><input type="radio" name="user" id="' + data.rows[i].id + '" class="i-checks"></label></td><td><a href="edit-complaint.html?id=' + data.rows[i].id + '">' + data.rows[i].applicant + '&nbsp;</a><span class="label label-info">' + data.rows[i].status + '</span></td><td><a href="#">' + data.rows[i].penitentiary + '</a></td><td>' + data.rows[i].username + '</td>';
            data.rows[i].document ? template += '<td><i class="notika-icon notika-paperclip"></i></td>' : template += '<td></td>';
            template += '<td class="text-right mail-date">' + data.rows[i].date + '</td></tr>';
        }

        addBlock(block, template);
        if (data.filtered == null || data.filtered == false) { setComplaintFilters(data); }
    }, outdata);
};

function DeleteComplaints(gid) {
    $('#deleteComplaintModal').modal('hide');

    if (gid) {
        var data = {};
        data.id = gid;
        data.method = 'delete';

        myStorage.fireFunc = 'window.location.href = "./complaints.html"';
        // переписать, когда будут данные
        ajaxCall("compalintsedit", checkResult, data);

        return false;
    }

    var selection = $('input[name=user][type=radio]:checked');
    for (var i = 0; i < selection.length; i++) {
        var id = selection.attr('id');
        var data = {};
        data.id = id;
        data.method = 'delete';

        myStorage.fireFunc = 'getComplaints();';
        // переписать, когда будут данные
        ajaxCall("compalintsedit", checkResult, data);

        break;
    }
}

function DeleteComplaintsModal(id) {
    if (id) {
        $('#deleteComplaintModal #DeleteComplaintsBtn').attr('onclick', 'DeleteComplaints(' + id + '); return false;');
    } else {
        $('#deleteComplaintModal #DeleteComplaintsBtn').attr('onclick', 'DeleteComplaints(); return false;');
    }
    $('#deleteComplaintModal').modal('show');
}


function fillOptionArray() {
    var option = $('.filter-option'),
        optionArray = [];

    for (var i = 0; i < option.length; i++) {
        var obj = {};
        obj.value = $(option[i]).html();
        optionArray.push(obj);
        // [{"value": "--"}, {"value": "--"}, {"value": "--"}];
    }
    window.optionArray = optionArray;
}

// function selectComplaints() {
//     var selection = $('.i-checks');

//     // Можно ли здесь одновременно поменять владельца у нескольких или нет?
//     for (var i = 0; i < selection.length; i++) {
//         var id = selection.attr('id');
//         var data = {};
//         data.method = 'update';
//         data.table = 'complaints';
//         data.where = 'cid=' + id;
//         data.setfields = {};
//         data.setfields.mentor = window.userName;

//         ajaxCall("./users.json", function(){
//             if (selection.length === i) {
//                 checkResult(1);
//             }
//         });
//     }
// }



function sortComplaints() {
    ajaxCall("./complaints.json", function(text) {
        var data = JSON.parse(text),
            template = '',
            block = $('#complaintsContainer');
        fillOptionArray();

        for (var i = 0; i < data.length; i++) {
            if (((window.optionArray[0].value === data[i].mentor) || (window.optionArray[0].value === "--")) && ((window.optionArray[1].value === data[i].status) || (window.optionArray[1].value === "--")) && ((window.optionArray[2].value === data[i].penitentiary) || (window.optionArray[2].value === "--"))) {
                template += '<tr class=""><td class=""><label><input type="checkbox"  id="' + data[i].id + '" class="i-checks"></label></td><td><a href="' + data[i].applicant + '">' + data[i].applicant + '&nbsp;</a><span class="label label-info">' + data[i].status + '</span></td><td><a href="#">' + data[i].penitentiary + '</a></td><td>' + data[i].mentor + '</td>';
                data[i].document ? template += '<td><i class="notika-icon notika-paperclip"></i></td>' : template += '<td></td>';
                template += '<td class="text-right mail-date">' + data[i].date + '</td></tr>';
            }
        }
        addBlock(block, template);
    })
};


function loadComplaint() {
    ajaxCall("./complaints.json", function(text) {
        var data = JSON.parse(text);
        var block = $('#linkContainer');

        var id = 0; // Сделать проверку
        $('#aplicantionNumber').attr("aplid", data[id].id);
        $('#aplicantionNumber').html(data[id].id);
        $('#aplicantName').html(data[id].applicant);
        $('#aplicantDateOfBirth').html(data[id].applicantDateOfBirth);
        $('#aplicantGender').html(data[id].gender);
        $('#aplicantPenitentiary').html(data[id].penitentiary);
        $('#aplicationType').html(data[id].type);
        $('#aplicationMentor').html(data[id].mentor);
        $('#aplicationContent').html(data[id].content);

        var template = '';

        for (var i = 0; i < data[id].links.length; i++) {
            template += '<a class="btn dw-al-ft" href="' + data[id].links[i].url + '" target="_blank">' + data[id].links[i].name + '<i class="notika-icon notika-file"></i></a>';
        }

        addBlock(block, template);
    });

    ajaxCall("./complaints.json", function(text) {
        var data = JSON.parse(text);

        var template = '',
            block = $('#aplicationButtonsContainer');

        if (data[id].mentor == '--') {
            template += '<button class="btn btn-default btn-sm waves-effect" onckick="selectComplaints(1)"><i class="fa fa-minus-square"></i> В разработку</button>';
        } else if ((data[id].mentor == window.userName)) {
            template += '<button class="btn btn-default btn-sm waves-effect" onclick="removeComplaints(1)"><i class="fa fa-minus-square"></i> Отказаться</button>';
        } else {
            template += " ";
        }

        addBlock(block, template);
    });
}

// Это функция, которая убирает ментора у жалобы.
function removeComplaints(type = 2) {
    if (type = 1) {
        var id = $('#aplicantionNumber').attr('aplid');
        var data = {};
        data.method = 'update';
        data.table = 'complaints';
        data.where = 'cid=' + id;
        data.setfields = {};
        data.setfields.mentor = " ";

        ajaxCall("./users.json", function() {
            checkResult(1);
        });
    } else {
        var selection = $('.i-checks');

        // Можно ли здесь одновременно поменять владельца у нескольких или нет?
        for (var i = 0; i < selection.length; i++) {
            var id = selection.attr('id');
            var data = {};
            data.method = 'update';
            data.table = 'complaints';
            data.where = 'cid=' + id;
            data.setfields = {};
            data.setfields.mentor = " ";

            ajaxCall("./users.json", function() {
                if (selection.length === i) {
                    checkResult(1);
                }
            });
        }
    }

}

// Эта функция удаляет
function deleteComplaints(type = 2) {
    if (type = 1) {
        var id = $('#aplicantionNumber').attr('aplid');
        var data = {};
        data.method = 'delete';
        data.table = 'complaints';
        data.where = 'cid=' + id;
        ajaxCall("./users.json", function() {
            checkResult(1);
        });
    } else {
        var selection = $('.i-checks');

        // Можно ли здесь одновременно поменять владельца у нескольких или нет?
        for (var i = 0; i < selection.length; i++) {
            var id = selection.attr('id');
            var data = {};
            data.method = 'delete';
            data.table = 'complaints';
            data.where = 'cid=' + id;


            ajaxCall("./users.json", function() {
                if (selection.length === i) {
                    checkResult(1);
                }
            });
        }
    }
}

function selectComplaints(type = 2) {
    if (type = 1) {
        var id = $('#aplicantionNumber').attr('aplid');
        var data = {};
        data.method = 'update';
        data.table = 'complaints';
        data.where = 'cid=' + id;
        data.setfields = {};
        data.setfields.mentor = window.userName;

        ajaxCall("./complaints.json", function() {
            checkResult(1);
        });
    } else {
        var selection = $('.i-checks');

        // Можно ли здесь одновременно поменять владельца у нескольких или нет?
        for (var i = 0; i < selection.length; i++) {
            var id = selection.attr('id');
            var data = {};
            data.method = 'update';
            data.table = 'complaints';
            data.where = 'cid=' + id;
            data.setfields = {};
            data.setfields.mentor = window.userName;

            ajaxCall("./users.json", function() {
                if (selection.length === i) {
                    checkResult(1);
                }
            });
        }
    }
}

function changeStatus() {

}

/*----------------------------------------*/
/*  4.  Мои жалобы
/*----------------------------------------*/

function getMyComplaints() {
    ajaxCall("./complaints.json", function(text) {
        var data = JSON.parse(text),
            template = '',
            block = $('#complaintsContainer');

        for (i = 0; i < data.length; i++) {
            if (data[i].mentor == 'Петр Петров') {
                template += '<tr><td><label><input type="checkbox" class="i-checks"></label></td><td><a href="' + data[i].url + '">' + data[i].applicant + ' </a><span class="label label-info">' + data[i].status + '</span></td><td>' + data[i].penitentiary + '</td><td>' + data[i].mentor + '</td>';
                data[i].document ? template += '<td><i class="notika-icon notika-paperclip"></i></td>' : template += '<td></td>';
                template += '<td class="text-right mail-date">' + data[i].date + '</td></tr>';
            }
        }

        addBlock(block, template);
    });
};


/*----------------------------------------*/
/*  5.  Пользователи
/*----------------------------------------*/
function getUsersData() {
    // запрос
    ajaxCall("./users.json", function(text) {
        var data = JSON.parse(text);

        // шаблон
        var block = $('#usersDataContainer');

        var template = '';

        for (var i = 0; i < data.length; i++) {

            template += '<div class="col-lg-3 col-md-4 col-sm-6 col-xs-12"><div class="contact-list"><div class="contact-win">';

            if (data[i].img != "") {
                template += '<div class="contact-img"><img src="' + data[i].img + '" alt="' + data[i].username + '" /></div>';
            } else {
                template += '<div class="contact-img"><img src="./img/post/user.png" alt="' + data[i].username + '" /></div>';
            }

            template += '<div class="conct-sc-ic">';


            if (data[i].vk != '') {
                template += '<a class="btn" href="' + data[i].vk + '"><i class="fa fa-vk"></i></a>';
            }
            if (data[i].email != '') {
                template += '<a class="btn" href="' + data[i].email + '"><i class="fa fa-envelope"></i></a>';
            }

            if (data[i].phone != '') {
                template += '<a class="btn" href="' + data[i].phone + '"><i class="fa fa-phone"></i></a>';
            }

            template += '</div></div><div class="contact-ctn"><div class="contact-ad-hd"><h2>' + data[i].username + '</h2><p class="ctn-ads">' + data[i].location + '</p></div>';

            if (data[i].about != '') {
                template += '<p>' + data[i].about + '</p>';
            }

            template += '</div></div></div>';
        }


        addBlock(block, template);
    });
}
/*----------------------------------------*/
/*  6.  Настройки
/*----------------------------------------*/
function getAccountSetting() {
    var outdata = {};
    outdata.id = myStorage.userID;

    ajaxCall('user', function(text) {
        var data = text;

        $('#userName').val(data[0].username);
        $('#userLocation').val(data[0].location);
        $('#userAbout').val(data[0].about);
        $('#userVk').val(data[0].vk);
        $('#userEmail').val(data[0].email);
        $('#userPhone').val(data[0].phone);
        $('#userImage').attr("src", data[0].img);
        $('#userImage').attr("alt", data[0].username);
    }, outdata);
}

function editAccountSetting() {
    var outdata = {};
    outdata.id = myStorage.userID;
    outdata.method = 'update';
    outdata.setfields = {};

    // Основные значения
    //outdata.setfields.ulogin = $('#userName').val();
    outdata.setfields.uname = $('#userName').val();
    outdata.setfields.ulocation = $('#userLocation').val();
    outdata.setfields.uabout = $('#userAbout').val();
    outdata.setfields.uvk = $('#userVk').val();
    outdata.setfields.uemail = $('#userEmail').val();
    outdata.setfields.uphone = $('#userPhone').val();

    // переписать, когда будут данные
    ajaxCall("useredit", checkResult, outdata);
}

function getExtension(str) {
    return str.slice(str.lastIndexOf('.'));
}

function deleteAccountModal() {
    $('#deleteAccountModal').modal('show');
}

function checkResultDelUser(data, result) {
    if (result < 0) {
        $('#alertModal .modal-body p').html(data.message);
        $('#alertModal').modal('show');
        return false;
    } else {
        return logout();
    }
}

function deleteAccount() {
    var outdata = {};
    outdata.id = myStorage.userID;

    $('#deleteAccountModal').modal('hide');

    // переписать, когда будут данные
    ajaxCall("deleteuser", checkResultDelUser, outdata);
}


function checkAccountPassword() {
    var pass1 = $('#newPassInput').val();
    var pass2 = $('#newPassInput2').val();

    if (pass1 != pass2) {
        $('#alertModal .modal-body p').html('Пароли не совпадают!');
        $('#alertModal').modal('show');
        return false;
    }

    var outdata = {};
    outdata.method = 'update';
    outdata.id = myStorage.userID;
    outdata.setfields = {};
    outdata.setfields.password = pass1;

    // переписать, когда будут данные
    ajaxCall("useredit", checkResult, outdata);
}

function editAccountPassword() {
    var id = window.userId;
    var data = {};
    data.setfields = {};
    data.where = 'uid=' + id;
    data.setfields.upass = $('userPassword').val();

    // переписать, когда будут данные
    ajaxCall("./users.json", checkResult(1));
}

/*----------------------------------------*/
/*  7. Вход, выход, регистрация
/*----------------------------------------*/
function logout(result) {
    ajaxCall('logout', doNextStep);
}

function doNextStep(data, result) {
    if (result < 0) {
        $('#gotError .modal-body p').html(data.message);
        $('#gotError').modal('show');
    } else {
        myStorage.userName = '';
        myStorage.userID = 0;
        myStorage.userRole = 0;
        location.href = window.location.origin + '/login.html'
    }
}

/*----------------------------------------*/
/*  8.  Старница "Запросы"
/*----------------------------------------*/

function loadRequests() {
    ajaxCall("./requests.json", function(text) {
        var data = JSON.parse(text),
            block = $('#requestContainer'),
            template = '';
        var id = 0; // Сделать проверку


        for (var i = 0; i < data.length; i++) {
            template += '<tr id="requestNumber" reqid="' + data[i].id + '"><td><label><input type="checkbox" class="i-checks"></label></td><td><a href="' + data[i].url + '">' + data[i].header + '</a></td><td>' + data[i].type + '</td><td>' + data[i].owner + '</td><td class="text-right mail-date">' + data[i].date + '</td></tr>';
        }

        addBlock(block, template);
    });
}

function deleteRequestDlg() {

}

function deleteRequest(type = 2) {
    if (type = 1) {
        var id = $('#requestNumber').attr('reqid');
        var data = {};
        data.method = 'delete';
        data.table = 'requests';
        data.where = 'rid=' + id;
        ajaxCall("./requests.json", function() {
            checkResult(1);
        });
    } else {
        var selection = $('.i-checks');

        // Можно ли здесь одновременно поменять владельца у нескольких или нет?
        for (var i = 0; i < selection.length; i++) {
            var id = selection.attr('reqid');
            var data = {};
            data.method = 'delete';
            data.table = 'requests';
            data.where = 'rid=' + id;


            ajaxCall("./requests.json", function() {
                if (selection.length === i) {
                    checkResult(1);
                }
            });
        }
    }
}

function editRequest(id) {
    if (id = -1) {
        var data = {};
        data.method = 'insert';
        data.setfields = {};
        data.setfields.header = $('#requestHeader').val();
        data.setfields.date = $('#requestDate').val();
        data.setfields.type = $('#requestType').val();
        data.setfields.description = $('#applicationType').val();
        data.setfields.url = "./request.html";
        data.setfields.owner = window.userName;

        // Придумать, как сделать проверку
        if (1 == 1) {
            data.setfields.document = 1;
        } else {

        }

        //data.setfields.date  должен создаваться автоматически дата подачи заявки
        //data.setfields.url должен создаваться автоматически. Или грузится не страница, а жалоба 


    } else {

    }

    // переписать, когда будут данные
    ajaxCall("./complaints.json", function() {
        checkResult(1)
    });
}

/*----------------------------------------*/
/*  9.  Меню администратора: пользователи
/*----------------------------------------*/
function adminGetUsers() {
    //myStorage.userPage = 0;
    var outdata = {};
    outdata.limit = (myStorage.userPage * rowsOnPage) + ', ' + rowsOnPage;
    outdata.id = myStorage.userID;
    ajaxCall("users", function(text) {
        console.log(text);
        var data = text,
            template = '',
            block = $('#adminUsersContainer');
        if (data.length < 1 && myStorage.userPage > 0) {
            myStorage.userPage = parseInt(myStorage.userPage) - 1;
            if (myStorage.userPage < 0) { myStorage.userPage = 0; }
            adminGetUsers();
        }

        for (i = 0; i < data.length; i++) {
            var color = '';
            if (data[i].role == 2) { color = ' style="color:blue;"'; }
            if (data[i].role == 1) { color = ' style="color:green;"'; }
            if (data[i].status == 1) { color = ' style="color:red;"'; }
            template += '<tr><td><label><input type="radio" name="user" id="' + data[i].id + '" ></label></td><td>' + data[i].id + '</td><td' + color + ' onclick="adminEditUserModalClick(' + data[i].id + ')">' + data[i].username + '</td><td>' + data[i].email + '</td><td>' + data[i].phone + '</td></tr>';
        }

        addBlock(block, template);
    }, outdata);
}

function adminaddUserPage(i) {
    myStorage.userPage = parseInt(myStorage.userPage) + parseInt(i);
    if (myStorage.userPage < 0) { myStorage.userPage = 0; }
    adminGetUsers();
}

function adminaddComplaisTypePage(i) {
    myStorage.userPage = parseInt(myStorage.userPage) + parseInt(i);
    if (myStorage.userPage < 0) { myStorage.userPage = 0; }
    adminGetComplaintsType();
}

function adminaddComplaisStatusPage(i) {
    myStorage.userPage = parseInt(myStorage.userPage) + parseInt(i);
    if (myStorage.userPage < 0) { myStorage.userPage = 0; }
    adminGetComplaintsStatus();
}

function adminaddPenitentiariesGroupPage(i) {
    myStorage.userPage = parseInt(myStorage.userPage) + parseInt(i);
    if (myStorage.userPage < 0) { myStorage.userPage = 0; }
    adminGetPenitentiariesGroup();
}

function adminaddComplaintsPage(i) {
    myStorage.userPage = parseInt(myStorage.userPage) + parseInt(i);
    if (myStorage.userPage < 0) { myStorage.userPage = 0; }
    getComplaints();
}

function adminDeleteUser() {
    $('#adminDeleteUserModal').modal('hide');
    var selection = $('input[name=user][type=radio]:checked');

    for (var i = 0; i < selection.length; i++) {
        var id = selection.attr('id');
        var data = {};
        data.id = id;

        myStorage.fireFunc = 'adminGetUsers();';
        ajaxCall("deleteuser", checkResult, data);
        break;
    }
}

function adminDeleteUserModal() {
    $('#adminDeleteUserModal').modal('show');
}

function showEditUserModal(id) {
    if (id < 1) {
        // Основные значения
        $('#userName').val('');
        $('#userLocation').val('');
        $('#userAbout').val('');
        $('#userVk').val('');
        $('#userEmail').val('');
        $('#userPhone').val('');
        $('#userPassword').val('');
        $('#userRole option').removeAttr('selected');

        if (myStorage.userRole > 0) {
            $('#adminEditUserModal #passDiv').show();
            $('#adminEditUserModal #roleDiv').show();
        } else {
            $('#adminEditUserModal #passDiv').hide();
            $('#adminEditUserModal #roleDiv').hide();
        }
        $('#adminEditUserModal #doEditUserID').attr('onclick', 'adminEditUser(-1); return false;');

        $('#adminEditUserModal').modal('show');
    } else {

    }
}

function adminEditUserModal() {
    var selection = $('input[name=user][type=radio]:checked');
    for (var i = 0; i < selection.length; i++) {
        var id = selection.attr('id');
        var data = {};
        data.id = id;

        ajaxCall("user", function(text) {
            var data = text;
            // Основные значения
            $('#userName').val(data[0].username);
            $('#userLocation').val(data[0].location);
            $('#userAbout').val(data[0].about);
            $('#userVk').val(data[0].vk);
            $('#userEmail').val(data[0].email);
            $('#userPhone').val(data[0].phone);
            $('#userPassword').val('');
            $('#userRole option').removeAttr('selected');
            $('#userRole option[value=' + data[0].role + ']').attr('selected', true);

            if (myStorage.userRole > 0) {
                $('#adminEditUserModal #passDiv').show();
                $('#adminEditUserModal #roleDiv').show();
            } else {
                $('#adminEditUserModal #passDiv').hide();
                $('#adminEditUserModal #roleDiv').hide();
            }

            $('#adminEditUserModal #doEditUserID').attr('onclick', 'adminEditUser(' + id + '); return false;');

            $("#avatarChoose").attr('user-id', id);
            $("#avatarUpload").attr('user-id', id);
            $("#removeAvatar").attr('user-id', id);

            $('#adminEditUserModal').modal('show');
        }, data);
        break;
    }
    return;
}

function adminEditUserModalClick(id) {
    // var selection = $('input[name=user][type=radio]:checked');
    // for (var i = 0; i < selection.length; i++) {
    // var id = selection.attr('id');
    var data = {};
    data.id = id;

    ajaxCall("user", function(text) {
        var data = text;
        // Основные значения
        $('#userName').val(data[0].username);
        $('#userLocation').val(data[0].location);
        $('#userAbout').val(data[0].about);
        $('#userVk').val(data[0].vk);
        $('#userEmail').val(data[0].email);
        $('#userPhone').val(data[0].phone);
        $('#userPassword').val('');
        $('#userRole option').removeAttr('selected');
        $('#userRole option[value=' + data[0].role + ']').attr('selected', true);

        if (myStorage.userRole > 0) {
            $('#adminEditUserModal #passDiv').show();
            $('#adminEditUserModal #roleDiv').show();
        } else {
            $('#adminEditUserModal #passDiv').hide();
            $('#adminEditUserModal #roleDiv').hide();
        }

        $('#adminEditUserModal #doEditUserID').attr('onclick', 'adminEditUser(' + id + '); return false;');

        $("#avatarChoose").attr('user-id', id);
        $("#avatarUpload").attr('user-id', id);
        $("#removeAvatar").attr('user-id', id);

        $('#adminEditUserModal').modal('show');
    }, data);
    // break;
    // }    
    return;
}

function adminEditUser(id) {
    $('#adminEditUserModal').modal('hide');

    var data = {};
    if (id < 1) {
        data.method = 'insert';
    } else {
        data.method = 'update';
    }
    data.id = id;
    data.setfields = {};

    // Основные значения
    //data.setfields.ulogin = $('#userName').val();
    data.setfields.uname = $('#userName').val();
    data.setfields.ulocation = $('#userLocation').val();
    data.setfields.uabout = $('#userAbout').val();
    data.setfields.uvk = $('#userVk').val();
    data.setfields.uemail = $('#userEmail').val();
    data.setfields.uphone = $('#userPhone').val();
    if (id < 1) {
        data.setfields.password = $('#userPassword').val();
        data.setfields.role = $('#userRole').val();
    }

    if (myStorage.userRole > 0 && $('#userPassword').val().trim() != '') {
        data.setfields.password = $('#userPassword').val();
        data.setfields.role = $('#userRole').val();
    }

    myStorage.fireFunc = 'adminGetUsers();';
    // переписать, когда будут данные
    ajaxCall("useredit", checkResult, data);

}
/*----------------------------------------*/
/*  10.  Меню администратора: жалобы
/*----------------------------------------*/
function adminGetComplaintsType() {
    var outdata = {};
    outdata.limit = (myStorage.userPage * rowsOnPage) + ', ' + rowsOnPage;
    ajaxCall("compalintstype", function(text) {
        var data = text,
            template = '',
            block = $('#adminComplaintsTypeContainer');

        if (data.length < 1 && myStorage.userPage > 0) {
            myStorage.userPage = parseInt(myStorage.userPage) - 1;
            if (myStorage.userPage < 0) { myStorage.userPage = 0; }
            adminGetComplaintsType();
        }

        for (i = 0; i < data.length; i++) {
            template += '<tr><td><label><input type="radio" name="user" id="' + data[i].id + '" ></label></td><td>' + data[i].id + '</td><td>' + data[i].name + '</td></tr>';
        }

        addBlock(block, template);
    }, outdata);
}

function adminComplaintsType(id) {
    $('#adminEditComplaintsTypeModal').modal('hide');

    var data = {};
    if (id < 1) {
        data.method = 'insert';
    } else {
        data.method = 'update';
    }
    data.id = id;
    data.setfields = {};

    // Основные значения
    data.setfields.name = $('#complaintsTypeName').val();

    myStorage.fireFunc = 'adminGetComplaintsType();';
    // переписать, когда будут данные
    ajaxCall("compalintstypeedit", checkResult, data);

}

function adminDeleteComplaintsType() {
    $('#adminDeleteComplaintsTypeModal').modal('hide');
    var selection = $('input[name=user][type=radio]:checked');
    for (var i = 0; i < selection.length; i++) {
        var id = selection.attr('id');
        var data = {};
        data.id = id;
        data.method = 'delete';

        myStorage.fireFunc = 'adminGetComplaintsType();';
        // переписать, когда будут данные
        ajaxCall("compalintstypeedit", checkResult, data);

        break;
    }
}

function adminDeleteComplaintsTypeModal() {
    $('#adminDeleteComplaintsTypeModal').modal('show');
}

function adminEditComplaintsTypeModal(id) {
    if (myStorage.userRole < 1) { return false; }

    $('#adminEditComplaintsTypeModal #complaintsTypeBtn').attr('onclick', 'adminComplaintsType(-1); return false;');

    if (id == -1) {
        $('#complaintsTypeId').val('');
        $('#complaintsTypeName').val('');


        $('#adminEditComplaintsTypeModal').modal('show');
    } else {
        $('#complaintsTypeId').val('');
        $('#complaintsTypeName').val('');

        var selection = $('input[name=user][type=radio]:checked');
        for (var i = 0; i < selection.length; i++) {
            var id = selection.attr('id');
            var data = {};
            data.id = id;
            $('#adminEditComplaintsTypeModal #complaintsTypeBtn').attr('onclick', 'adminComplaintsType(' + id + '); return false;');

            ajaxCall("compalintstype", function(text) {
                var data = text;

                $('#complaintsTypeId').val(data[0].id);
                $('#complaintsTypeName').val(data[0].name);

                $('#adminEditComplaintsTypeModal').modal('show');
            }, data);

            break;
        }
    }
}

//----------------
function adminGetComplaintsStatus() {
    var outdata = {};
    outdata.limit = (myStorage.userPage * rowsOnPage) + ', ' + rowsOnPage;
    ajaxCall("compalintsstatus", function(text) {
        var data = text,
            template = '',
            block = $('#adminComplaintsStatusContainer');

        if (data.length < 1 && myStorage.userPage > 0) {
            myStorage.userPage = parseInt(myStorage.userPage) - 1;
            if (myStorage.userPage < 0) { myStorage.userPage = 0; }
            adminGetComplaintsStatus();
        }

        for (i = 0; i < data.length; i++) {
            template += '<tr><td><label><input type="radio" name="user" id="' + data[i].id + '" ></label></td><td>' + data[i].id + '</td><td>' + data[i].name + '</td></tr>';
        }

        addBlock(block, template);
    }, outdata);
}

function adminEditComplaintsStatusModal(id) {
    if (myStorage.userRole < 1) { return false; }

    $('#adminEditComplaintsStatusModal #complaintsStatusBtn').attr('onclick', 'adminComplaintsStatus(-1); return false;');

    if (id == -1) {
        $('#adminComplaintsStatusId').val('');
        $('#adminComplaintsStatusName').val('');


        $('#adminEditComplaintsStatusModal').modal('show');
    } else {
        $('#adminComplaintsStatusId').val('');
        $('#adminComplaintsStatusName').val('');

        var selection = $('input[name=user][type=radio]:checked');
        for (var i = 0; i < selection.length; i++) {
            var id = selection.attr('id');
            var data = {};
            data.id = id;
            $('#adminEditComplaintsStatusModal #complaintsStatusBtn').attr('onclick', 'adminComplaintsStatus(' + id + '); return false;');

            ajaxCall("compalintsstatus", function(text) {
                var data = text;

                $('#adminComplaintsStatusId').val(data[0].id);
                $('#adminComplaintsStatusName').val(data[0].name);

                $('#adminEditComplaintsStatusModal').modal('show');
            }, data);

            break;
        }
    }
}


function adminComplaintsStatus(id) {
    $('#adminEditComplaintsStatusModal').modal('hide');

    var data = {};
    if (id < 1) {
        data.method = 'insert';
    } else {
        data.method = 'update';
    }
    data.id = id;
    data.setfields = {};

    // Основные значения
    data.setfields.name = $('#adminComplaintsStatusName').val();

    myStorage.fireFunc = 'adminGetComplaintsStatus();';
    // переписать, когда будут данные
    ajaxCall("compalintsstatusedit", checkResult, data);

}

function adminDeleteComplaintsStatus() {
    $('#adminDeleteComplaintsStatusModal').modal('hide');
    var selection = $('input[name=user][type=radio]:checked');
    for (var i = 0; i < selection.length; i++) {
        var id = selection.attr('id');
        var data = {};
        data.id = id;
        data.method = 'delete';

        myStorage.fireFunc = 'adminGetComplaintsStatus();';
        // переписать, когда будут данные
        ajaxCall("compalintsstatusedit", checkResult, data);

        break;
    }
}

function adminDeleteComplaintsStatusModal() {
    $('#adminDeleteComplaintsStatusModal').modal('show');
}


//----------------
function adminGetPenitentiariesGroup() {
    var outdata = {};
    outdata.limit = (myStorage.userPage * rowsOnPage) + ', ' + rowsOnPage;
    ajaxCall("penitentiaries", function(text) {
        var data = text,
            template = '',
            groups = '<select class="combobox form-control" id="adminPenitentiariesGroups"><option></option>',
            block = $('#adminPenitentiariesGroup');

        if (data.rows.length < 1 && myStorage.userPage > 0) {
            myStorage.userPage = parseInt(myStorage.userPage) - 1;
            if (myStorage.userPage < 0) { myStorage.userPage = 0; }
            adminGetPenitentiariesGroup();
        }

        for (i = 0; i < data.groups.length; i++) {
            groups += '<option value="' + data.groups[i].id + '">' + data.groups[i].name + '</option>';
        }
        myStorage.groups = groups + '</select>';

        for (i = 0; i < data.rows.length; i++) {
            template += '<tr><td><label><input type="radio" name="user" id="' + data.rows[i].id + '" ></label></td><td>' + data.rows[i].id + '</td><td>' + data.rows[i].name + '</td><td>' + data.rows[i].groupname + '</td></tr>';
        }

        addBlock(block, template);

    }, outdata);
}

function clearGroups() {
    $('#adminPenitentiariesGroups').remove();
    $('#adminPenitentiariesGroupsDiv').html(myStorage.groups);
    var timer = setInterval(function() {
        if ($("#adminPenitentiariesGroups").length) {
            clearInterval(timer);
            $('#adminPenitentiariesGroups').combobox({ clearIfNoMatch: false });
        }
    }, 200);
}

function setGroups() {
    $('#adminPenitentiariesGroups').remove();
    $('#adminPenitentiariesGroupsDiv').html(myStorage.selectedgroups);
    var timer = setInterval(function() {
        if ($("#adminPenitentiariesGroups").length) {
            clearInterval(timer);
            $('#adminPenitentiariesGroups').combobox({ clearIfNoMatch: false });
        }
    }, 200);
}

function adminEditPenitentiariesGroupModal(id) {
    if (myStorage.userRole < 1) { return false; }

    $('#adminEditPenitentiariesGroupModal #PenitentiariesGroupBtn').attr('onclick', 'adminPenitentiaries(-1); return false;');

    if (id == -1) {
        $('#adminPenitentiariesGroupId').val('');
        $('#adminPenitentiariesGroupName').val('');
        clearGroups();


        $('#adminEditPenitentiariesGroupModal').modal('show');

    } else {
        $('#adminPenitentiariesGroupId').val('');
        $('#adminPenitentiariesGroupName').val('');

        var selection = $('input[name=user][type=radio]:checked');
        for (var i = 0; i < selection.length; i++) {
            var id = selection.attr('id');
            var outdata = {};
            outdata.id = id;
            $('#adminEditPenitentiariesGroupModal #PenitentiariesGroupBtn').attr('onclick', 'adminPenitentiaries(' + id + '); return false;');

            ajaxCall("penitentiaries", function(text) {
                var data = text;
                var groups = '<select class="combobox form-control" id="adminPenitentiariesGroups"><option></option>';

                for (i = 0; i < data.groups.length; i++) {
                    var sel = '';
                    if (data.rows[0].groupid == data.groups[i].id) { sel = ' selected'; }
                    groups += '<option value="' + data.groups[i].id + '"' + sel + '>' + data.groups[i].name + '</option>';
                }
                myStorage.selectedgroups = groups + '</select>';

                $('#adminPenitentiariesGroupId').val(data.rows[0].id);
                $('#adminPenitentiariesGroupName').val(data.rows[0].name);

                setGroups();

                $('#adminEditPenitentiariesGroupModal').modal('show');
            }, outdata);

            break;
        }
    }
}

function adminPenitentiaries(id) {
    $('#adminEditPenitentiariesGroupModal').modal('hide');

    var data = {};
    if (id < 1) {
        data.method = 'insert';
    } else {
        data.method = 'update';
    }
    data.id = id;
    data.setfields = {};

    // Основные значения
    data.setfields.name = $('#adminPenitentiariesGroupName').val();
    data.setfields.groupname = $('#adminPenitentiariesGroupsDiv input.combobox').val();

    myStorage.fireFunc = 'adminGetPenitentiariesGroup();';
    // переписать, когда будут данные
    ajaxCall("penitentiariesedit", checkResult, data);

}

function adminDeletePenitentiariesGroupModal() {
    $('#adminDeletePenitentiariesGroupModal').modal('show');
}

function adminDeletePenitentiariesGroup() {
    $('#adminDeletePenitentiariesGroupModal').modal('hide');
    var selection = $('input[name=user][type=radio]:checked');
    for (var i = 0; i < selection.length; i++) {
        var id = selection.attr('id');
        var data = {};
        data.id = id;
        data.method = 'delete';

        myStorage.fireFunc = 'adminGetPenitentiariesGroup();';
        // переписать, когда будут данные
        ajaxCall("penitentiariesedit", checkResult, data);

        break;
    }
}



$(document).ready(function() {
    $.urlParam = function(name) {
        var results = new RegExp('[\?&]' + name + '=([^&#]*)')
            .exec(window.location.search);

        return (results !== null) ? results[1] || 0 : false;
    }

    if ($("#demo1-upload").length > 0) {
        var ddd = new Dropzone("#demo1-upload", {
            success: function(file, response) {
                var l = window.location.pathname;
                if (l != '/add-complaint.html') {
                    myStorage.fireFunc = 'document.location.reload()';
                    checkResult(JSON.parse(response));
                }
            }
        });
    }
});