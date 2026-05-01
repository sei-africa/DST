$(document).ready(function() {
    ajax_url_endpoint_prefix();
    // 
    var divUser = userAccount(DATA_USERS, PAGE_CTRL);
    $('#user-account').append(divUser);
    $("#btn-submit-pwd").on("click", changePasswordPost);

    if (DATA_USERS.extract.includes('usermpoints')) {
        userDataFilesTable(DATA_USERS['multipoints'], 'multipoints');
        uploadUserFiles('multipoints', false);
    }

    if (DATA_USERS.extract.includes('userpolygons')) {
        userDataFilesTable(DATA_USERS['shapefiles'], 'shapefiles');
        uploadUserFiles('shapefiles', true);
    }

    if (DATA_USERS.extract.includes('usergeojson')) {
        userDataFilesTable(DATA_USERS['geojson'], 'geojson');
        uploadUserFiles('geojson', false);
    }
});

function userDataFilesTable(userfiles, colname) {
    var divModal = $('#divModal-' + colname);
    divModal.empty();

    var listTable = $('#user-table-' + colname);
    listTable.empty();

    if (userfiles.length > 0) {
        for (i = 0; i < userfiles.length; i++) {
            let id_modal = colname + '-modal-' + i;
            let user_file = userfiles[i];
            // modal
            var divM0 = $('<div>').addClass('modal fade')
                .attr({ 'id': id_modal, 'tabindex': '-1', 'aria-hidden': 'true' });
            var divM1 = $('<div>').addClass('modal-dialog').appendTo(divM0);
            var divM2 = $('<div>').addClass('modal-content').appendTo(divM1);

            var divMh = $('<div>').addClass('modal-header').appendTo(divM2);
            $('<h1/>').addClass('modal-title fs-5').text('Delete User File').appendTo(divMh);
            $("<button>", {
                type: 'button',
                class: 'btn-close',
                'data-bs-dismiss': 'modal',
                'aria-label': 'Close'
            }).appendTo(divMh);

            var divMb = $('<div>').addClass('modal-body').appendTo(divM2);
            $('<p>').html('Are you sure you want to permanently delete <i>' + user_file + '</i>?').appendTo(divMb);

            var divMf = $('<div>').addClass('modal-footer').appendTo(divM2);
            $("<button>", {
                type: 'button',
                class: 'btn btn-secondary',
                'data-bs-dismiss': 'modal',
                text: 'Close'
            }).appendTo(divMf);
            $("<button>", {
                type: 'button',
                class: 'btn btn-danger',
                text: 'Delete',
                click: () => {
                    hideModalDialog(id_modal);
                    deleteUserFile(user_file, colname);
                }
            }).appendTo(divMf);

            divModal.append(divM0);

            // table
            var row = $('<tr>');
            $('<th>').attr('scope', 'row').text(i + 1).appendTo(row);
            $('<td>').text(user_file).appendTo(row);
            var td_del = $('<td>').appendTo(row);
            var del_btn = $("<button>", {
                type: 'button',
                // id: 'deleteFileBtn-' + i,
                class: 'delete-files-trash',
                'data-bs-toggle': 'modal',
                'data-bs-target': '#' + id_modal
            }).appendTo(td_del);

            // var img_src = '/static/images/trash.svg';
            // var img_src = Flask.url_for('static', { 'filename': 'images/trash.svg' });
            var img_src = ajaxURLprefix + '/static/images/trash.svg';

            $('<img/>', { src: img_src }).appendTo(del_btn);

            listTable.append(row);
        }
    }
}

function deleteUserFile(userfile, colname) {
    var data = {
        'file': userfile,
        'colname': colname
    };

    var endpoint = create_endpoint_get('delete_user_files', 'auth');
    $.ajax({
        url: endpoint,
        data: data,
        dataType: "json",
        success: (json) => {
            if (json.status == 'success') {
                var userfiles = DATA_USERS[colname];
                var index = userfiles.indexOf(userfile);
                userfiles.splice(index, 1);
                DATA_USERS[colname] = userfiles;
                userDataFilesTable(userfiles, colname);
            }
            flashMessage(json.message, json.status);
        },
        error: (xhr, s, e) => {
            displayAjaxError(xhr, s, e);
        }
    });
}