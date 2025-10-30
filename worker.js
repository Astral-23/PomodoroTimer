let timerId = null;

self.onmessage = function(e) {
    const command = e.data;

    if (command === 'start') {
        if (timerId === null) {
            timerId = setInterval(() => {
                self.postMessage('tick');
            }, 1000);
        }
    } else if (command === 'stop') {
        clearInterval(timerId);
        timerId = null;
    }
};
