const $ = require('jquery');
const gmail = require('../../engine/api-content/gmail.js');
const path = require('path');

let scrollPrint = true;

function messageToHtml(message, delay) {
    let parsedHeaders =
        gmail.parse.getHeaders(message);

    let dateObj = new Date(Date.parse(parsedHeaders['Date']));

    $('#mailTable>tbody').append(
        $('<tr id="' + message.id + '">' +
            '<td>' + parsedHeaders['From'] + '</td>' +
            '<td>' + parsedHeaders['Subject'] + '</td>' +
            '<td>' + dateObj.toISOString().slice(0, 10) + '</td>' +
            '</tr>').hide().delay(delay).show(100)
    );
}

function printCache() {
    if (gmail.cache.length !== 0) {
        console.log('Cache is not empty!');
        for (let i = 0; i < gmail.cache.length; i++) {
            messageToHtml(gmail.cache[i], 20 * (i + 1));
        }
        return true;
    } else {
        return false;
    }
}

function printMessages() {
    gmail.request.getMailMessageList(function(messages) {
        let i = 1;
        for (let key in messages) {
            messageToHtml(messages[key], 20 * i++);
        }
        scrollPrint = true;
    });
}

function printMessageContent(message_id) {
    gmail.request.getMailCachedContent(message_id, function(message) {
        let content = gmail.parse.getBody(message);

        $('#mailTable>tbody>tr#' + message.id).after(
            $('<tr id="' + message.id + '_snippet">' +
            '<td colspan="3">' + content + '</td>' +
            '</tr>').hide().delay(250).fadeIn(250)
        );
    });
}

/** Document specific JQUERY **/

$(document).ready(function() {
    printMessages();
});

// Catch the ajax call and print our email cache
$(document).ajaxComplete(function(e, xhr, settings) {
    console.log(settings.url);
    console.log(path.normalize(__dirname + '/mail.html'));
    if (settings.url === path.normalize(__dirname + '/mail.html')) {
        if (printCache() === false) {
            printMessages();
        }
    }
});

$(window).scroll(function() {
    if (($(window).scrollTop() + $(window).height() >
            $(document).height() - $(document).height() / 3) &&
        scrollPrint === true) {
        scrollPrint = false;
        printMessages();
    }
});

/* SHOULD BE REMOVED LATER ON WHEN SCROLL FUNCTION FEELS 110% NICE
$(document).on('click', '#getMail', function(e) {
    e.preventDefault();
    printMessages();
});
*/

$(document).on('click', '#sendMail', function(e) {
    e.preventDefault();
    // Here we will toggle window and prepare for mail to be sent
});

$(document).on('click', '#mailTable>tbody>tr', function(e) {
    e.preventDefault();
    console.log(this.id);
    printMessageContent(this.id);
});
