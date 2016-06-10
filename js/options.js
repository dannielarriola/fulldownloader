// Saves options to chrome.storage.sync.
function save_options() {
    var code = document.getElementById('code').value;
    chrome.storage.sync.set({
        codeRegExp: code,
    }, function () {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Codigo guardado';
        setTimeout(function () {
            status.textContent = '';
        }, 750);
    });
}

function restore_options() {
    chrome.storage.sync.get({
        codeRegExp: ''
    }, function (items) {
        document.getElementById('code').value = items.codeRegExp;
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);