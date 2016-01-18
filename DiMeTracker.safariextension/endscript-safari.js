// Only run in main window, not frames
if (window.top === window) {
    
    const ev = {    
        uri: window.location.href, 
        title: document.title, 
        text: document.all[0].innerText
    }

    safari.self.tab.dispatchMessage("pageLoaded", ev);

}
