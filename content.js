$(document).ready(function() {
    function formatURLForDisplay(url) {
        return url.replace(/^(https?:\/\/)?(www\.)?/, '');
    }
    chrome.storage.local.get(['blockedWebsites'], function(result) {
        let arrayWebsites = result.blockedWebsites || [];
        arrayWebsites.forEach(function(website) {
            $("ul.blocked").append('<li class="mb-2"><a class="content text-decoration-none">' + formatURLForDisplay(website) + '</a><button data-item="'+ website +'" type="button" class="deleteWebsite btn ms-3 btn-sm btn-danger fw-bold">Remover</button></li>');
        });
    });

    $('#form').on('submit', function(event) {
        event.preventDefault();
        const inputValue = $('#websiteName').val();

        if (inputValue === '') {
            alert('Introduz um Website');
        } else {
            chrome.storage.local.get(['blockedWebsites'], function(result) {
                let arrayWebsites = result.blockedWebsites || [];
                arrayWebsites.push(inputValue);
                chrome.storage.local.set({ 'blockedWebsites': arrayWebsites }, function() {
                    console.log('Array atualizado e armazenado:', arrayWebsites);
                    $("ul.blocked").append('<li class="mb-2"><a class="content text-decoration-none">' + formatURLForDisplay(inputValue) + '</a><button data-item="'+ inputValue +'" type="button" class="deleteWebsite btn ms-3 btn-sm btn-danger fw-bold">Remover</button></li>');
                    
                    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                        chrome.tabs.sendMessage(tabs[0].id, { action: "updateBlockedWebsites" });
                    });
                });
            });
            $('#websiteName').val('');
        }
    });

    $('.blocked').on('click', '.deleteWebsite', function() {
        let itemRemover = $(this).data('item');
        console.log('Remover:', itemRemover);

        chrome.storage.local.get(['blockedWebsites'], function(result) {
            let arrayWebsites = result.blockedWebsites || [];
            arrayWebsites = arrayWebsites.filter(function(item) {
                return item !== itemRemover;
            });
            chrome.storage.local.set({ 'blockedWebsites': arrayWebsites }, function() {
                console.log('Array após remoção e atualização do storage:', arrayWebsites);
                $(this).parent().remove();

                chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, { action: "updateBlockedWebsites" });
                });
            }.bind(this));
        });
    });
});


chrome.storage.local.get(['blockedWebsites'], function(result) {
    let arrayWebsites = result.blockedWebsites || [];
    const currentURL = window.location.href;

    function blockPage() {
        $('body').html("<h1>This site is blocked.</h1>");
        $('body').css({
            "background-color": "red",
            "color": "white",
            "text-align": "center",
            "padding": "20px"
        });
    }

    if (arrayWebsites.some(website => currentURL.startsWith(website))) {
        blockPage();
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "updateBlockedWebsites") {
        chrome.storage.local.get(['blockedWebsites'], function(result) {
            arrayWebsites = result.blockedWebsites || [];
            const currentURL = window.location.href;

            if (arrayWebsites.some(website => currentURL.startsWith(website))) {
                blockPage();
            }
        });
    }
});
