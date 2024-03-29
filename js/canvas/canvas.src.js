// Canvas (custom build 2023-12-11--11-56-26)
"use strict";
// globals: document, window

var CA = window.CA || {};

// file: canvas.js
// Canvas prototype
// globals: document, window, CanvasRenderingContext2D


// polyfill
if (CanvasRenderingContext2D.prototype.resetTransform === undefined) {
    CanvasRenderingContext2D.prototype.resetTransform = function () {
        this.setTransform(1, 0, 0, 1, 0, 0);
    };
}

CA.Canvas = function (aElementOrId, aWidth, aHeight, aStretch) {
    // Create canvas and context, handle resize
    var t = this;
    if (aElementOrId) {
        // auto-resized on-screen canvas
        t.canvas = typeof aElementOrId === 'string' ? document.getElementById(aElementOrId) : aElementOrId;
        if (!t.canvas) {
            throw "CA.Canvas cannot find element " + aElementOrId;
        }
        window.addEventListener('resize', function () {
            t.resize();
        });
        window.addEventListener('DOMContentLoaded', function () {
            t.resize();
        });
        // stretch to parent flex
        if (aStretch) {
            // parent must be relative
            if (window.getComputedStyle(t.canvas.parentElement, 'position').position !== 'relative') {
                console.error('Parent of stretched canvas ' + aElementOrId + ' must have position: relative');
            }
            // canvas must be absolute
            if (window.getComputedStyle(t.canvas, 'position').position !== 'absolute') {
                console.error('Stretched canvas ' + aElementOrId + ' must have position: absolute');
            }
            t.canvas.style.minWidth = '1px';
            t.canvas.style.minHeight = '1px';
            t.canvas.style.flex = 1;
            t.canvas.style.width = '100%';
            t.canvas.style.height = '100%';
        }
        t.resize();
    } else {
        // fixed-size off-screen canvas
        t.canvas = document.createElement('canvas');
        t.resize(aWidth, aHeight);
    }
    t.context = t.canvas.getContext('2d');
    t.canvas.context = t.context;
    t.canvas.context.ca_canvas = t;
};

CA.canvas = function (aElementOrId, aWidth, aHeight, aStretch) {
    // Call without new
    return new CA.Canvas(aElementOrId, aWidth, aHeight, aStretch);
};

CA.Canvas.prototype.dup = function () {
    // Return copy of this canvas, including content
    var c = new CA.Canvas(null, this.width, this.height);
    c.context.drawImage(this.canvas, 0, 0);
    return c;
};

CA.Canvas.prototype.resize = function (aWidth, aHeight) {
    // Change canvas resolution to it's natural size
    //console.log('par', aWidth, aHeight, 'can', this.canvas.width, this.canvas.height, 'clientwh', this.canvas.clientWidth, this.canvas.clientHeight);
    this.width = aWidth || this.canvas.clientWidth;
    this.height = aHeight || this.canvas.clientHeight;
    this.w = this.width;
    this.h = this.height;
    this.w2 = this.width / 2;
    this.h2 = this.height / 2;
    var old = this.canvas.getContext('2d').imageSmoothingEnabled;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.getContext('2d').imageSmoothingEnabled = old;
    if (this.render) {
        this.render();
    }
};

CA.Canvas.prototype.debug = function () {
    // Stroke canvas across and show it's id
    //this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.beginPath();
    this.context.strokeStyle = 'red';
    this.context.moveTo(0, 0);
    this.context.lineTo(this.canvas.width, this.canvas.height);
    this.context.stroke();
    this.context.fillStyle = 'lime';
    this.context.fillText(this.canvas.id || 'null', 10, 10);
};

CA.Canvas.prototype.bringToTop = function () {
    // Show canvas on full page so that it can be right-click downloaded
    var t = this,
        div = document.createElement('div'),
        close = document.createElement('button'),
        old_parent = this.canvas.parentElement,
        bgIndex = 0,
        bg = ['red', 'green', 'blue', 'fuchsia', 'lime', 'yellow', 'white', 'black'];
    div.style.position = 'fixed';
    div.style.zIndex = 2147483647;
    div.style.left = 0;
    div.style.top = 0;
    div.style.width = '100vw';
    div.style.height = '100vh';
    // checkers background
    div.style.backgroundImage = 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUAQMAAAC3R49OAAAABlBMVEX///8AAABVwtN+AAAAE0lEQVQI12NgsP9AFP5/gIEYDAAkgh1NckgLUgAAAABJRU5ErkJggg==)';
    div.onclick = function () {
        div.style.backgroundImage = '';
        div.style.backgroundColor = bg[bgIndex % bg.length];
        bgIndex++;
    };
    // canvas
    div.appendChild(this.canvas);
    // close
    close.textContent = 'Close';
    close.style.position = 'fixed';
    close.style.top = '1ex';
    close.style.right = '1ex';
    close.style.padding = '1ex';
    close.onclick = function () {
        div.parentElement.removeChild(div);
        if (old_parent) {
            old_parent.appendChild(t.canvas);
        }
    };
    div.appendChild(close);
    document.body.appendChild(div);
    return div;
};

CA.Canvas.prototype.clear = function (aColor) {
    // Clear canvas or fill it with color
    if (aColor) {
        this.context.globalAlpha = 1;
        this.context.globalCompositeOperation = 'source-over';
        this.context.fillStyle = aColor;
        this.context.fillRect(0, 0, this.w, this.h);
        this.context.fillStyle = 'black';
    } else {
        this.context.clearRect(0, 0, this.w, this.h);
    }
};

CA.Canvas.prototype.drawImageRotated = function (aImage, aX, aY, aWidth, aHeight, aAngleRad, aCenterX, aCenterY) {
    // Draw rotated image on canvas centered around centerpoint on image, (aX,aY) is placed where the center point is!
    var cx = aWidth * aCenterX / aImage.width,
        cy = aHeight * aCenterY / aImage.height;
    this.context.save();
    this.context.translate(aX, aY);
    this.context.rotate(aAngleRad);
    this.context.translate(-cx, -cy);
    this.context.drawImage(aImage, 0, 0, aWidth, aHeight);
    this.context.restore();
};

CA.Canvas.prototype.line = function (aX1, aY1, aX2, aY2, aStrokeStyle, aWidth) {
    // Draw a line
    this.context.strokeStyle = aStrokeStyle || 'red';
    this.context.lineWidth = aWidth || 1;
    this.context.beginPath();
    this.context.moveTo(aX1, aY1);
    this.context.lineTo(aX2, aY2);
    this.context.closePath();
    this.context.stroke();
};

CA.Canvas.prototype.rectangle = function (aX1, aY1, aX2, aY2, aStrokeStyle, aLineWidth, aFillStyle) {
    // Draw stroked rectangle
    this.context.lineWidth = aLineWidth || 1;
    if (arguments.length < 5) {
        aStrokeStyle = 'red';
    }
    if (aStrokeStyle) {
        this.context.strokeStyle = aStrokeStyle;
    }
    if (aFillStyle) {
        this.context.fillStyle = aFillStyle;
    }
    this.context.beginPath();
    this.context.moveTo(aX1, aY1);
    this.context.lineTo(aX2, aY1);
    this.context.lineTo(aX2, aY2);
    this.context.lineTo(aX1, aY2);
    this.context.closePath();
    if (aFillStyle) {
        this.context.fill();
    }
    if (aStrokeStyle) {
        this.context.stroke();
    }
};

CA.Canvas.prototype.circle = function (aX, aY, aRadius, aStrokeStyle, aLineWidth, aFillStyle) {
    // Draw circle
    this.context.lineWidth = aLineWidth || 1;
    if (arguments.length < 4) {
        aStrokeStyle = 'red';
    }
    if (aStrokeStyle) {
        this.context.strokeStyle = aStrokeStyle;
    }
    if (typeof aFillStyle === 'string') {
        this.context.fillStyle = aFillStyle;
    }
    this.context.beginPath();
    this.context.arc(aX, aY, aRadius, 0, 2 * Math.PI);
    if (aFillStyle) {
        this.context.fill();
    }
    if (aStrokeStyle) {
        this.context.stroke();
    }
};

CA.Canvas.prototype.label = function (aText, aX, aY, aFillStyle, aStrokeStyle) {
    // Print text label (mostly for debugging)
    this.context.globalAlpha = 1;
    this.context.globalCompositeOperation = 'source-over';
    this.context.fillStyle = aFillStyle || 'lime';
    this.context.textBaseline = 'top';
    this.context.textAlign = 'left';
    this.context.font = '12px sans-serif';
    this.context.fillText(aText, aX, aY);
    if (aStrokeStyle) {
        this.context.strokeStyle = aStrokeStyle;
        this.context.strokeText(aText, aX, aY);
    }
};

CA.Canvas.prototype.download = function (aFileName) {
    // Download canvas as image
    var a = document.createElement('a'),
        fn = aFileName || 'image.png',
        ext = fn.split('.').slice(-1)[0].toLowerCase(), // slice is shallow, string is value
        mime = {
            "png": "image/png",
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
            "webp": "image/webp"
        };
    if (!mime.hasOwnProperty(ext)) {
        throw "Cannot download canvas as " + fn + ", allowed extensions are: " + Object.keys(mime).join(', ');
    }
    a.download = fn;
    a.href = this.canvas.toDataURL(mime[ext]);
    document.body.appendChild(a);
    a.click();
};


// file: ajax.js
// Simplified ajax request
// globals: document, window, XMLHttpRequest
// provide: ajax, json


CA.ajax = function (aUrl, aParams, aCallback, aMethod) {
    // Simplified ajax request
    // Example: CA.ajax("http://example.com/divide/", {a: 22, b: 7}, function (aOk, aResponse) { if (aOk) { alert(aResponse); } );
    var k, p = [], xhr;

    // params
    try {
        for (k in aParams) {
            if (aParams.hasOwnProperty(k)) {
                p.push(encodeURIComponent(k) + '=' + encodeURIComponent(aParams[k]));
            }
        }
    } catch (e) {
        if (aCallback) {
            aCallback(false, 'ajax: invalid params - ' + e);
        }
    }

    // request
    try {
        xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                if (aCallback) {
                    aCallback(true, xhr.responseText, aParams);
                }
            }
            if (xhr.readyState === 4 && xhr.status !== 200) {
                console.error('ajax failed: #' + xhr.status + ' - ' + xhr.statusText + ' url ' + aUrl);
                if (aCallback) {
                    aCallback(false, 'ajax: failed #' + xhr.status + " " + xhr.statusText + ' url ' + aUrl);
                }
            }
        };
        //aUrl += (aUrl.match('?') ? '&' : '?') + 'ajax_cache_timestampt=' + Date.now();
        xhr.open(aMethod || "POST", aUrl, true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
        xhr.send(p.join('&'));
    } catch (e) {
        console.error('ajax: ' + e);
        if (aCallback) {
            aCallback(false, 'ajax: ' + e);
        }
    }
};

CA.json = function (aUrl, aParams, aCallback, aMethod) {
    // Ajax call and parse it as json
    CA.ajax(aUrl, aParams, function (aOk, aData) {
        if (!aOk) {
            return aCallback(aOk, aData);
        }
        try {
            var o = JSON.parse(aData);
        } catch (e) {
            console.warn(e, aData);
            return aCallback(false, e);
        }
        return aCallback(aOk, o);
    }, aMethod);
};


// file: browser.js
// Detect browser type, version and capabilities
// globals: document, window, navigator
// require: defaults
// provide: browser


CA.browser = (function () {
    var self = {}, ua = window.navigator.userAgent, m;

    // defaults
    self.chrome = false;
    self.type = undefined;
    self.msie = false;
    self.firefox = false;
    self.msie = false;
    self.edge = false;
    self.safari = false;
    self.version = undefined;
    self.blur = true;
    self.language = 'en';
    self.touch = navigator.maxTouchPoints > 0;
    self.android = navigator.userAgent.toLowerCase().indexOf("android") > -1;
    self.iphone = navigator.userAgent.toLowerCase().indexOf("iPhone") > -1;
    self.ios = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
    self.windows = navigator.platform === 'Win32';
    self.linux = navigator.platform.match(/linux/i);

    // Detect user language from browser or language param
    (function () {
        var br = (navigator.languages && navigator.languages[0].substr(0, 2)) || (navigator.language && navigator.language.substr(0, 2)),
            param = CA.defaults && CA.defaults.language && CA.defaults.language.value;
        if (CA.defaults && CA.defaults.language && CA.defaults.language.fromUrl) {
            self.language = param || br;
            return;
        }
        self.language =  br || param;
    }());

    // IE 10 or older
    m = ua.indexOf('MSIE ');
    if (m > 0) {
        self.type = 'msie';
        self.msie = true;
        self.blur = false;
        self.version = parseInt(ua.substring(m + 5, ua.indexOf('.', m)), 10);
    }
    // IE 11
    m = ua.indexOf('Trident/');
    if (m > 0) {
        m = ua.indexOf('rv:');
        self.type = 'msie';
        self.msie = true;
        self.blur = false;
        self.version = parseInt(ua.substring(m + 3, ua.indexOf('.', m)), 10);
    }
    // EDGE (IE 12+)
    m = ua.indexOf('Edge/');
    if (m > 0) {
        self.type = 'edge';
        self.msie = true;
        self.edge = true;
        self.blur = false;
        self.version = parseInt(ua.substring(m + 5, ua.indexOf('.', m)), 10);
    }

    // Firefox
    m = window.navigator.userAgent.match(/Firefox\/([0-9]+)\./);
    if (m) {
        self.type = 'firefox';
        self.firefox = true;
        self.blur = true;
        self.version = parseInt(m[1], 10);
    }

    // Chrome
    m = window.navigator.userAgent.match(/Chrome\/([0-9]+)\./);
    if (m) {
        self.type = 'chrome';
        self.chrome = true;
        self.blur = true;
        self.version = parseInt(m[1], 10);
    }

    // Safari
    m = window.navigator.userAgent.match(/Safari\/([0-9]+)\./);
    if (m && (window.safari !== undefined)) {
        self.type = 'safari';
        self.safari = true;
        self.blur = true;
        self.version = parseInt(m[1], 10);
    }

    // other browser
    return self;
}());


// file: choose_files.js
// Let user choose files and pass their content to callback
// globals: window, document, FileReader, Image


CA.chooseFiles = function (aCallbackFiles, aMime, aSingleFile, aReadAsDataURL) {
    // Let user choose files and pass their content to callback
    var form, input, doneFiles = [];

    // input
    form = document.createElement('form');
    form.method = 'post';
    input = document.createElement('input');
    input.type = 'file';
    if (aMime) {
        input.accept = aMime;
    }
    input.multiple = !aSingleFile;
    input.required = true;
    input.style.display = 'block';
    input.style.border = '1px solid red';
    input.style.boxSizing = 'border-box';
    input.style.width = '100%';

    function readerOnLoad(event) {
        // single file loaded
        event.target.myFile.data = event.target.result;
        doneFiles.push(event.target.myFile);
        if ((event.loaded === event.total) && (doneFiles.length === event.target.myCount)) {
            if (aCallbackFiles) {
                if (input.parentElement) {
                    input.parentElement.removeChild(input);
                }
                aCallbackFiles(doneFiles);
            }
            doneFiles = [];
        }
    }

    input.addEventListener('change', function (event) {
        // process files
        var i, reader, file, files;
        files = event.target.files;
        for (i = 0; i < files.length; i++) {
            file = files[i];
            // read each file content
            reader = new FileReader();
            reader.addEventListener("load", readerOnLoad);
            reader.myFile = file;
            reader.myName = file.name;
            reader.myCount = files.length;
            if (aReadAsDataURL) {
                reader.readAsDataURL(file);
            } else {
                reader.readAsBinaryString(file);
            }
        }
    });

    // add input to form and click on it to start
    form.appendChild(input);
    input.click();
};

CA.chooseImage = function (aCallback, aMaxWidthHeight) {
    // Let user choose image and return it as canvas, optionally shrunk
    var file_input, file_reader, image, file_name;

    // image
    image = new Image();
    image.addEventListener('load', function () {
        var canvas = document.createElement('canvas');
        if (aMaxWidthHeight && (image.width > aMaxWidthHeight || image.height > aMaxWidthHeight)) {
            if (image.width > image.height) {
                canvas.width = aMaxWidthHeight;
                canvas.height = Math.round(aMaxWidthHeight * image.height / image.width);
            } else {
                canvas.width = Math.round(aMaxWidthHeight * image.width / image.height);
                canvas.height = aMaxWidthHeight;
            }
        } else {
            canvas.width = image.width;
            canvas.height = image.height;
        }
        canvas.context = canvas.getContext('2d');
        //canvas.context.imageSmoothingEnabled = false;
        canvas.context.drawImage(image, 0, 0, canvas.width, canvas.height);
        aCallback(canvas, file_name);
    }, false);

    // file reader
    file_reader = new window.FileReader();
    file_reader.addEventListener('load', function (event) {
        image.src = event.target.result;
    });

    // file input element
    file_input = document.createElement('input');
    file_input.type = 'file';
    file_input.accept = 'image/*';
    file_input.addEventListener('change', function (event) {
        file_name = event.target.files[0].name;
        file_reader.readAsDataURL(event.target.files[0]);
    });
    file_input.click();
};

// file: clipboard.js
// Copy text to clipboard
// globals: document, window, setTimeout
// provide: copyToClipboard


CA.copyToClipboard = function (aText) {
    // Copy text to clipboard
    var input = document.createElement('textarea');
    input.style.position = 'fixed';
    input.style.left = 0;
    input.style.top = 0;
    input.style.width = '10px';
    input.style.height = '10px';
    input.style.opacity = 0;
    document.body.appendChild(input);
    input.value = aText;
    input.select();
    document.execCommand("copy");
    setTimeout(function () {
        input.parentElement.removeChild(input);
    }, 5000);
};


// file: distance_point_line.js
// Distance from point to infinite line
// globals: document, window
// provide: distancePointLine


CA.distancePointLine = function (aX, aY, aX1, aY1, aX2, aY2) {
    // Distance from point (aX, aY) to infinite line defined by 2 points (aX1, aY1, aX2, aY2)
    return ((Math.abs((aY2 - aY1) * aX -
                     (aX2 - aX1) * aY +
                     aX2 * aY1 -
                     aY2 * aX1)) /
            (Math.pow((Math.pow(aY2 - aY1, 2) +
                       Math.pow(aX2 - aX1, 2)),
                      0.5)));
};


// file: distance_point_line_segment.js
// Distance from point to line segment
// globals: document, window
// provide: distancePointLineSegment, distancePointLineSegments


CA.distancePointLineSegment = function (x, y, x1, y1, x2, y2) {
    // Return distance from point to line segment
    var A, B, C, D, dot, len_sq, param, xx, yy, dx, dy;
    A = x - x1;
    B = y - y1;
    C = x2 - x1;
    D = y2 - y1;
    dot = A * C + B * D;
    len_sq = C * C + D * D;
    param = -1;
    if (len_sq !== 0) {
        param = dot / len_sq;
    }
    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }
    dx = x - xx;
    dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
};

CA.distancePointLineSegments = function (x, y, aPoints) {
    // Return distance from point to line defined by points [[x1,y1], [x2,y2], ..., [xn, yn]]
    var i, x1, y1, x2, y2, d, m = Number.MAX_VALUE;
    for (i = 0; i < aPoints.length - 1; i++) {
        x1 = aPoints[i][0];
        y1 = aPoints[i][1];
        x2 = aPoints[i + 1][0];
        y2 = aPoints[i + 1][1];
        d = CA.distancePointLineSegment(x, y, x1, y1, x2, y2);
        if (d < m) {
            m = d;
        }
    }
    return m;
};


// file: download.js
// Download piece of data
// globals: document, window, Blob, URL, setTimeout
// provide: download


CA.download = function (aData, aFileName) {
    // Download piece of data using blob (recommended)
    if (typeof aData !== 'string') {
        throw "CA.download(data) data must be string";
    }
    var blob = new Blob([aData], { type: "text/plain" }),
        a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = aFileName || 'data.txt';
    document.body.appendChild(a);
    a.onclick = function () {
        a.parentElement.removeChild(a);
        // Chrome workaround
        //var old = document.body.style.opacity;
        //document.body.style.opacity = 0.99;
        //document.body.style.opacity = old;
    };
    a.click();
};

CA.downloadWithoutBlob = function (aData, aFileName) {
    // Download piece of data without using blobs (not recommended)
    if (typeof aData !== 'string') {
        throw "CA.download(data) data must be string";
    }
    var a = document.createElement('a');
    a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(aData);
    a.download = aFileName || 'data.txt';
    document.body.appendChild(a);
    a.onclick = function () {
        a.parentElement.removeChild(a);
        // Chrome workaround
        //var old = document.body.style.opacity;
        //document.body.style.opacity = 0.99;
        //document.body.style.opacity = old;
    };
    a.click();
};


// file: images.js
// Multiple images synchromized loader
// globals: document, window, Image
// provide: imagescache


CA.imagesCache = {};

CA.images = function (aNamesArray, aCallbackAsoc, aCallbackErrors) {
    // Load one or multiple images and call callback when all are ready
    aNamesArray = typeof aNamesArray === 'string' ? [aNamesArray] : aNamesArray;
    var i, remaining = aNamesArray.length, o = {}, img;
    function onLoad(event) {
        var im = event.target || (event.path && event.path[0]),
            src = im.dataSrc;
        remaining--;
        CA.imagesCache[src] = im;
        o[src] = im;
        if (remaining <= 0) {
            aCallbackAsoc(o);
        }
    }
    function onError(event) {
        var im = event.target || (event.path && event.path[0]),
            src = im && im.dataSrc;
        if (aCallbackErrors) {
            aCallbackErrors(src, event);
        } else {
            console.error('Cannot load image ', src, event);
        }
    }
    for (i = 0; i < aNamesArray.length; i++) {
        if (CA.imagesCache.hasOwnProperty(aNamesArray[i])) {
            remaining--;
            o[aNamesArray[i]] = CA.imagesCache[aNamesArray[i]];
            if (remaining <= 0) {
                aCallbackAsoc(o);
            }
        } else {
            img = new Image();
            img.dataSrc = aNamesArray[i];
            img.onload = onLoad;
            img.onerror = onError;
            img.src = aNamesArray[i];
        }
    }
};


// file: interval.js
// Interval operations
// globals: document, window


CA.intervalIntersection = function (a, b) {
    // Return intersection of two intervals, e.g. ([1,5],[4,10]) returns [4,5]
    if (a[0] > a[1]) {
        a.reverse();
    }
    if (b[0] > b[1]) {
        b.reverse();
    }
    // single point overlap, returns e.g. [4,4]
    if (a[1] === b[0]) {
        return [a[1], a[1]];
    }
    // long overlap
    var e, f;
    e = Math.max(a[0], b[0]);
    f = Math.min(a[1], b[1]);
    if (e < f) {
        return [e, f];
    }
    // no overlap returns undefined
};

console.assert(CA.intervalIntersection([0, 10], [7, 20]).join(' ') === '7 10');
console.assert(CA.intervalIntersection([7, 20], [0, 10]).join(' ') === '7 10');
console.assert(CA.intervalIntersection([0, 1], [9, 10]) === undefined);
console.assert(CA.intervalIntersection([9, 10], [0, 1]) === undefined);
console.assert(CA.intervalIntersection([0, 4], [4, 5]).join(' ') === '4 4');
console.assert(CA.intervalIntersection([3, 3], [3, 3]).join(' ') === '3 3');
console.assert(CA.intervalIntersection([3, 3], [3, 4]).join(' ') === '3 3');

// file: label_input.js
// Label+Input combinations for modalDialog
// globals: document, window, CA, Android, Storage

CA.button = function (aTextContent, aCallback) {
    // Create button, callback get's button text as 1st argument, button itself as second argument
    var button = document.createElement('button');
    button.textContent = aTextContent;
    button.onclick = function () {
        aCallback(aTextContent, button);
    };
    return button;
};

CA.select = function (aOptions, aDatalist, aSelectElementToReplace) {
    // HTML select element from array or object
    var select = aSelectElementToReplace || document.createElement(aDatalist ? 'datalist' : 'select'),
        option,
        i,
        k;
    if (Array.isArray(aOptions)) {
        for (i = 0; i < aOptions.length; i++) {
            option = document.createElement('option');
            option.value = aOptions[i];
            option.textContent = aOptions[i];
            select.appendChild(option);
        }
    } else {
        for (k in aOptions) {
            if (aOptions.hasOwnProperty(k)) {
                option = document.createElement('option');
                option.value = k;
                option.textContent = aOptions[k];
                select.appendChild(option);
            }
        }
    }
    select.style.width = '100%';
    return select;
};

CA.selectEnableOptions = function (aSelect, aOptionsToEnable) {
    // In SELECT element enable only specified options
    var i, o = aSelect.getElementsByTagName('option');
    for (i = 0; i < o.length; i++) {
        if (aOptionsToEnable === true) {
            o[i].disabled = false;
            continue;
        }
        if (aOptionsToEnable === false) {
            o[i].disabled = true;
            continue;
        }
        o[i].disabled = aOptionsToEnable.indexOf(o[i].value) < 0;
        if (o[i].disabled && o[i].value === aSelect.value) {
            aSelect.value = undefined;
        }
    }
};

CA.labelInputLabels = [];

CA.labelInputLabelsSameWidth = function () {
    // Make labels in CA.labelInputLabels[] same min-width to align modalDialog labels
    var i, m = 0;
    for (i = 0; i < CA.labelInputLabels.length; i++) {
        m = Math.max(m, CA.labelInputLabels[i].clientWidth);
    }
    for (i = 0; i < CA.labelInputLabels.length; i++) {
        CA.labelInputLabels[i].style.minWidth = m + 'px';
    }
};

CA.labelInput = function (aParent, aLabel, aInputType, aUnits) {
    // Label and input
    var div = document.createElement('div'),
        label = document.createElement('label'),
        input = document.createElement('input'),
        units;
    if (aInputType === 'textarea') {
        input = document.createElement('textarea');
        input.style.height = '1em';
    }
    if (aInputType instanceof window.HTMLElement) {
        input = aInputType;
    }
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.appendChild(label);
    div.style.paddingBottom = '0.5ex';
    div.style.paddingLeft = '0.5ex';
    div.style.paddingRight = '0.5ex';
    aParent.appendChild(div);
    label.textContent = aLabel;
    //label.style.width = '5em';
    label.style.display = 'inline-block';
    label.style.textAlign = 'right';
    label.style.paddingRight = '0.5ex';
    label.style.boxSizing = 'border-box';
    CA.labelInputLabels.push(label);
    // input
    if (aInputType instanceof window.HTMLElement) {
        input = aInputType;
    } else {
        if (aInputType !== 'textarea') {
            input.type = aInputType;
        }
        if (aInputType !== 'checkbox') {
            input.style.flex = 1;
        }
    }
    div.appendChild(input);
    // units
    if (aUnits) {
        units = document.createElement('span');
        units.textContent = aUnits;
        if (aUnits === ' ') {
            units.innerHTML = '&nbsp;';
        }
        units.style.minWidth = '1em';
        div.appendChild(units);
    }
    //console.log(label.clientWidth);
    CA.labelInputLabelsSameWidth();
    input.enterkeyhint = 'next';
    input.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            CA.focusNext(event.target);
        }
    });
    return {
        div: div,
        label: label,
        input: input,
        units: units,
        enable: function (aEnabled) {
            input.disabled = !aEnabled;
            label.style.opacity = aEnabled ? 1 : 0.5;
        }
    };
};

CA.labelButtons = function (aParent, aLabel, aButtons, aCallback) {
    // Add label and multiple buttons
    var i, ret = CA.labelInput(aParent, aLabel, 'hidden');
    ret.button = {};
    for (i = 0; i < aButtons.length; i++) {
        ret.button[aButtons[i]] = CA.button(aButtons[i], aCallback);
        ret.div.appendChild(ret.button[aButtons[i]]);
    }
    return ret;
};

CA.labelButtonsAssoc = function (aParent, aLabel, aButtonCallbackObject) {
    // Add label and multiple buttons
    var k, ret = CA.labelInput(aParent, aLabel, 'hidden');
    ret.button = {};
    for (k in aButtonCallbackObject) {
        if (aButtonCallbackObject.hasOwnProperty(k)) {
            ret.button[k] = CA.button(k, aButtonCallbackObject[k]);
            ret.div.appendChild(ret.button[k]);
        }
    }
    return ret;
};

CA.labelCheckboxLabel = function (aParent, aLabel1, aChecked, aLabel2) {
    // Create label, checkbox and label for modal dialog
    var div = document.createElement('div'),
        label1 = document.createElement('label'),
        input = document.createElement('input'),
        label2 = document.createElement('label'),
        span = document.createElement('span');
    // first label
    label1.textContent = aLabel1;
    label1.style.display = 'inline-block';
    label1.style.textAlign = 'right';
    label1.style.paddingRight = '0.5ex';
    label1.style.boxSizing = 'border-box';
    label1.style.minWidth = '83px';
    div.appendChild(label1);
    div.style = 'display: flex; align-items: center; padding-bottom: 0.5ex; padding-left: 0.5ex; padding-right: 0.5ex';
    CA.labelInputLabels.push(label1);
    // second label with checkbox and label2 span
    input.type = 'checkbox';
    input.checked = aChecked;
    input.style.verticalAlign = 'middle';
    label2.appendChild(input);
    span.textContent = aLabel2;
    span.style.userSelect = 'none';
    label2.appendChild(span);
    div.appendChild(label2);
    aParent.appendChild(div);
    // same width labels
    CA.labelInputLabelsSameWidth();
    // enter focuses next
    input.enterkeyhint = 'next';
    input.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            CA.focusNext(event.target);
        }
    });
    return {
        div: div,
        label1: label1,
        label2: label2,
        input: input,
        span: span
    };
};

CA.labelLabel = function (aParent, aLabel, aLabel2) {
    // Label and another label, used for notes under previous input
    var div = document.createElement('div'),
        label = document.createElement('label'),
        label2 = document.createElement('label');
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.appendChild(label);
    div.style.paddingBottom = '0.5ex';
    div.style.paddingLeft = '0.5ex';
    div.style.paddingRight = '0.5ex';
    aParent.appendChild(div);
    // label
    label.textContent = aLabel;
    label.style.display = 'inline-block';
    label.style.textAlign = 'right';
    label.style.paddingRight = '0.5ex';
    label.style.boxSizing = 'border-box';
    CA.labelInputLabels.push(label);
    // label2
    label2.textContent = aLabel2;
    div.appendChild(label2);

    CA.labelInputLabelsSameWidth();
    return {
        div: div,
        label: label,
        label2: label2,
        enable: function (aEnabled) {
            label.style.opacity = aEnabled ? 1 : 0.5;
            label2.style.opacity = aEnabled ? 1 : 0.5;
        }
    };
};

// file: line_intersection.js
// Find intersection of 2 line segments
// globals: document, window
// provide: lineIntersection, lineIntersects


CA.lineIntersection = function (x1, y1, x2, y2, x3, y3, x4, y4) {
    // Return point of two 2d line segments intersection
    // 1=3, 1=4, 2=3, 2=4
    if (x1 === x3 && y1 === y3) {
        return {x: x1, y: y1, seg1: true, seg2: true, intersects: true};
    }
    if (x1 === x4 && y1 === y4) {
        return {x: x1, y: y1, seg1: true, seg2: true, intersects: true};
    }
    if (x2 === x3 && y2 === y3) {
        return {x: x2, y: y2, seg1: true, seg2: true, intersects: true};
    }
    if (x2 === x4 && y2 === y4) {
        return {x: x2, y: y2, seg1: true, seg2: true, intersects: true};
    }
    var ua, ub, denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1), i1, i2,
        xx, yy;
    if (denom === 0) {
        if (CA.distancePointLine(x1, y1, x3, y3, x4, y4) <= 0) {
            // collinear line segments
            xx = CA.intervalIntersection([x1, x2], [x3, x4]);
            yy = CA.intervalIntersection([y1, y2], [y3, y4]);
            if (xx && yy) {
                return {
                    x: xx[0],
                    y: yy[0],
                    x2: xx[1],
                    y2: yy[1],
                    seg1: true,
                    seg2: true,
                    intersects: true,
                    interval1: xx,
                    interval2: yy
                };
            }
            // collinear but not overlapping
            return null;
        }
        // parallel
        return null;
    }
    ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
    ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
    i1 = ua >= 0 && ua <= 1;
    i2 = ub >= 0 && ub <= 1;
    return {
        x: x1 + ua * (x2 - x1),
        y: y1 + ua * (y2 - y1),
        seg1: i1,
        seg2: i2,
        intersects: i1 && i2
    };
};

CA.lineIntersects = function (x1, y1, x2, y2, x3, y3, x4, y4) {
    // Return intersection point of two lines or false
    // 1=3, 1=4, 2=3, 2=4
    if (x1 === x3 && y1 === y3) {
        return true;
    }
    if (x1 === x4 && y1 === y4) {
        return true;
    }
    if (x2 === x3 && y2 === y3) {
        return true;
    }
    if (x2 === x4 && y2 === y4) {
        return true;
    }
    if (x1 === x2 && y1 === y2) {
        // line 1 is dot
        return CA.pointOnLineSegment(x1, y1, x3, y3, x4, y4);
    }
    if (x3 === x4 && y3 === y4) {
        // line 2 is dot
        return CA.pointOnLineSegment(x3, y4, x1, y1, x2, y2);
    }
    if (x1 === x2 && y1 === y2 && x3 === x4 && y3 === y4) {
        // both lines are dots
        return x1 === x3 && y1 === y3;
    }
    // Return true if two lines intersects
    var ua, ub, denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1), xx, yy;
    if (denom === 0) {
        if (CA.distancePointLine(x1, y1, x3, y3, x4, y4) <= 0) {
            // collinear line segments
            xx = CA.intervalIntersection([x1, x2], [x3, x4]);
            yy = CA.intervalIntersection([y1, y2], [y3, y4]);
            if (xx && yy) {
                return true;
            }
            // collinear but not overlapping
            return null;
        }
        return false;
    }
    ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
    ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
    return (ua >= 0 && ua <= 1) && (ub >= 0 && ub <= 1);
};


// file: log.js
// Sending logging message (manually) and errors (automatically) to server
// globals: document, window
// require: ajax, defaults
// provide: lasterror


CA.log = function () {
    // Send log message to server
    var i, s = [];
    for (i = 0; i < arguments.length; i++) {
        s.push(arguments[i].toString());
    }
    s = s.join(', ').replace(/\\n/g, ' (EOL) ');
    if (CA.defaults && CA.defaults.log_server && CA.defaults.log_server.value) {
        if (s.indexOf(CA.defaults.log_server.value) <= 0) {
            CA.ajax(CA.defaults.log_server.value, {message: s});
        }
    } else {
        if (!CA.log.warnShown) {
            console.warn('CA.defaults.log_server is missing');
            CA.log.warnShown = true;
        }
    }
};

(function () {
    var errorsSent = 0, old_console_error = console.error;

    // Send on console.error
    console.error = function () {
        var a = [], i;
        for (i = 0; i < arguments.length; i++) {
            a.push(arguments[i]);
        }
        old_console_error.apply(console, a);
        errorsSent++;
        if (errorsSent <= 10) {
            CA.log.apply(CA, a);
        }
    };

    // Send on standard error
    window.addEventListener('error', function (event) {
        errorsSent++;
        CA.lastError = event;
        if (errorsSent <= 10) {
            try {
                // note that on file:/// it will be empty
                var o, f;
                try {
                    f = event.filename.split('/').slice(-1)[0]; // slice is shallow and string is value
                } catch (ignore2) {
                    f = event.filename;
                }
                o = f + ':' + event.lineno + ':' + event.colno + ': ' + event.message;
                // send it to server
                CA.log('error', o, document.location.toString());
            } catch (ignore) {
            }
        }
    });
}());

// file: modal_dialog.js
// Modal dialog with message and buttons
// globals: document, window
// require: translations, browser
// provide: modal, modalDialog


CA.modalDialog = function (aTitle, aMessage, aButtons, aCallback) {
    // Modal dialog with message and buttons
    var m, c, i, p, nav, b, orig = [], buttonPressed = false, content,
        lang = (CA.browser && CA.browser.language) || 'en',
        t = CA.translations && CA.translations[lang];

    if (typeof aButtons === 'string') {
        aButtons = aButtons.split(',');
    }
    orig = aButtons.slice(); // slice is shallow and buttons are strings

    // translate
    if (t && t.modal && t.modal[aTitle]) {
        t = t.modal[aTitle];
        if (!t.message) {
            console.warn('CA.translations.' + lang + '.' + aTitle + '.message is missing');
        }
        aMessage = t.message || aMessage;
        if (!t.buttons) {
            console.warn('modalDialog ' + aTitle + ' has no buttons in ' + lang);
        } else {
            for (i = 0; i < aButtons.length; i++) {
                if (t.buttons.hasOwnProperty(aButtons[i])) {
                    aButtons[i] = t.buttons[aButtons[i]];
                } else {
                    console.warn('modalDialog ' + aTitle + ' has no button ' + aButtons[i] + ' in ' + lang);
                }
            }
        }
    }

    function onClose() {
        // Close without choice
        if (!buttonPressed && aCallback) {
            aCallback();
        }
    }
    m = CA.modal(aTitle || '', onClose);
    // content (above buttons)
    content = document.createElement('div');
    content.className = 'ca_content';
    content.style.overflowY = 'auto';
    m.content = content;
    m.div.appendChild(content);
    m.div.style.display = 'flex';
    m.div.style.flexDirection = 'column';
    m.div.style.overflowY = 'auto';
    m.div.style.maxHeight = '100vh';
    // container
    c = document.createElement('div');
    c.className = 'ca_buttons';
    c.style.textAlign = 'center';
    c.style.padding = '0 1ex 1ex 1ex';
    m.container = c;
    m.div.appendChild(c);
    // message
    if (aMessage) {
        p = document.createElement('div');
        p.textContent = aMessage;
        p.style.padding = '1em';
        content.appendChild(p);
        m.message = p;
    }
    function onClick(event) {
        if (!aCallback) {
            buttonPressed = true;
            m.close.click();
            return;
        }
        if (aCallback(event.target.dataItem, event.target.dataIndex) !== false) {
            buttonPressed = true;
            m.close.click();
        }
    }
    if (aButtons) {
        nav = document.createElement('div');
        nav.style.display = 'flex';
        nav.style.justifyContent = 'center';
        m.buttonsDiv = nav;
        m.buttons = {};
        c.appendChild(nav);
        for (i = 0; i < aButtons.length; i++) {
            b = document.createElement('button');
            b.dataItem = orig[i];
            b.dataIndex = i;
            b.textContent = aButtons[i];
            b.onclick = onClick;
            m.buttons[orig[i]] = b;
            nav.appendChild(b);
        }
    }

    return m;
};


// file: modal.js
// Showing modals inside page
// globals: document, window, setTimeout
// require: aabb, browser, settings, translations, translation


CA.modalVisible = null;

CA.modal = function (aTitle, aCallback) {
    // Showing modal with title and close button with dark transparent background
    var bg, div, more, close, nav, h1, hide, onKeyDown,
        lang = (CA.browser && CA.browser.language) || 'en',
        t = CA.translations && CA.translations[lang];
    // translation
    if (t && t.modal && t.modal[aTitle]) {
        t = t.modal[aTitle];
        if (!t.title) {
            console.warn('CA.translations.' + lang + '.modal.' + aTitle + '.title is missing');
        }
        aTitle = t.title || aTitle;
    }
    // bg
    bg = document.createElement('div');
    bg.style.position = 'fixed';
    bg.style.left = '0';
    bg.style.top = '0';
    bg.style.width = '100vw';
    bg.style.height = '100vh';
    bg.style.backgroundColor = 'rgba(0,0,0,0.3)';
    bg.style.display = 'flex';
    bg.style.alignItems = 'center';
    bg.style.justifyContent = 'center';
    bg.style.zIndex = CA.zIndex.slow();
    document.body.appendChild(bg);
    // div
    div = document.createElement('div');
    div.className = 'ca_modal';
    //div.style.position = 'fixed';
    div.style.fontFamily = 'sans-serif';
    div.style.fontSize = 'medium';
    div.style.boxShadow = '0 0 1ex rgba(0,0,0,0.3)';
    div.style.borderRadius = '0.5ex';
    div.style.backgroundColor = 'white';
    //div.style.overflowY = 'auto';
    div.style.maxWidth = '100vw';
    div.style.maxHeight = '100vh';
    bg.appendChild(div);
    // nav
    nav = document.createElement('div');
    nav.className = 'ca_nav';
    nav.style.display = 'flex';
    div.appendChild(nav);
    // close
    more = document.createElement('button');
    more.textContent = '?';
    more.style.display = 'none';
    more.style.minWidth = 'initial';
    more.style.minHeight = 'initial';
    more.style.border = 'none';
    more.style.backgroundColor = 'transparent';
    more.style.marginTop = '0';
    more.style.outline = 'none';
    more.title = (t && t.more) || 'More options';
    nav.appendChild(more);
    // h1
    h1 = document.createElement('div');
    h1.textContent = aTitle || '';
    h1.style.flex = 1;
    h1.style.fontSize = 'large';
    h1.style.fontWeight = 'bold';
    h1.style.textAlign = 'center';
    h1.style.whiteSpace = 'nowrap';

    function movable() {
        // Make this dialog movable by dragging it's title
        h1.style.border = '1px solid white';
        h1.style.cursor = 'pointer';
        h1.style.userSelect = 'none';
        var sx, sy, moving, nx, ny, r, titleMouseDown, titleMouseUp, ae;
        h1.onmousedown = function (event) {
            ae = document.activeElement;
            sx = event.screenX;
            sy = event.screenY;
            moving = true;
            r = div.getBoundingClientRect();
            div.style.position = 'fixed';
            div.style.left = r.left + 'px';
            div.style.top = r.top + 'px';
            window.addEventListener('mousemove', titleMouseDown);
            window.addEventListener('mouseup', titleMouseUp);
        };
        titleMouseDown = function (event) {
            if (moving) {
                nx = event.screenX;
                ny = event.screenY;
                div.style.left = (r.left + nx - sx) + 'px';
                div.style.top = (r.top + ny - sy) + 'px';
            }
        };
        titleMouseUp = function () {
            window.removeEventListener('mousemove', titleMouseDown);
            window.removeEventListener('mouseup', titleMouseUp);
            if (ae) {
                ae.focus();
            }
        };
    }
    movable();

    h1.style.margin = 0;
    h1.style.padding = 0;
    nav.appendChild(h1);

    hide = function () {
        // hide dialog
        window.requestAnimationFrame(function () {
            CA.modalVisible = null;
        });
        if (bg.parentElement) {
            bg.parentElement.removeChild(bg);
        }
        if (div.parentElement) {
            div.parentElement.removeChild(div);
        }
        window.removeEventListener('keydown', onKeyDown, true);
        if (aCallback) {
            aCallback();
        }
    };

    // close
    close = document.createElement('button');
    close.style.minWidth = 'initial';
    close.style.minHeight = 'initial';
    close.textContent = '\u2716'; //'❌';
    close.style.border = 'none';
    close.style.backgroundColor = 'transparent';
    close.style.outline = 'none';
    close.title = (t && t.close) || 'Close';
    close.onclick = hide;
    nav.appendChild(close);
    /*
    close.style.position = 'fixed';
    close.style.boxShadow = '0 0 1ex rgba(0,0,0,0.3)';
    close.style.borderRadius = '0.5ex';
    close.style.backgroundColor = 'white';
    close.style.overflowY = 'auto';
    */


    //document.body.appendChild(div);

    onKeyDown = function (event) {
        if (event.key === 'Escape') {
            hide();
        }
    };

    bg.onmousedown = function (event) {
        if (event.target === bg || event.target === close) {
            hide();
        }
    };

    function toAabb(aBox) {
        // Move this modal to given AABB
        div.style.left = aBox.x + 'px';
        div.style.top = aBox.y + 'px';
        div.style.width = aBox.width + 'px';
        div.style.height = aBox.height + 'px';
    }

    function near(aElement, aWidth, aHeight, aObstacle) {
        // Snap this modal near other element while avoiding obstacle
        var q = CA.aabb(aElement).near(aWidth, aHeight, CA.aabb(aObstacle)).grow(-8);
        toAabb(q);
        return q;
    }

    function full() {
        // make modal full page
        div.style.left = 0;
        div.style.top = 0;
        div.style.width = '100%';
        div.style.height = '100%';
        div.style.borderRadius = 0;
    }

    window.addEventListener('keydown', onKeyDown, true);
    // remember current modal
    CA.modalVisible = {
        bg: bg,
        div: div,
        nav: nav,
        h1: h1,
        more: more,
        close: close,
        toAabb: toAabb,
        near: near,
        translation: t,
        full: full,
        //movable: movable,
        color: function (aBg) {
            div.style.backgroundColor = aBg;
        }
    };
    return CA.modalVisible;
};

// file: perf.js
// Performance monitoring
// globals: document, window


CA.perf = (function () {
    var self = {};
    self.block = {};

    self.begin = function (aBlock) {
        // Start the measuring of a block
        self.block[aBlock] = self.block[aBlock] || {
            frames: 0,
            time: 0,
            max: 0
        };
        self.block[aBlock].begin = Date.now();
    };

    self.end = function (aBlock) {
        // End the measuring of a block
        if (!self.block[aBlock]) {
            self.begin(aBlock);
        }
        var dt = Date.now() - self.block[aBlock].begin;
        self.block[aBlock].frames++;
        self.block[aBlock].time += dt;
        delete self.block[aBlock].begin;
        self.block[aBlock].avg = self.block[aBlock].time / self.block[aBlock].frames;
        if (dt > self.block[aBlock].max) {
            self.block[aBlock].max = dt;
        }
    };

    self.clear = function (aBlock) {
        // Clear one block or all blocks
        if (aBlock) {
            self.block[aBlock] = self.block[aBlock] || {};
            self.block[aBlock].frames = 0;
            self.block[aBlock].time = 0;
            self.block[aBlock].avg = 0;
            self.block[aBlock].max = 0;
        } else {
            self.block = {};
        }
    };

    self.show = function () {
        // Show stats and clear all measurements
        var k, a = [], o;
        for (k in self.block) {
            if (self.block.hasOwnProperty(k)) {
                o = JSON.parse(JSON.stringify(self.block[k]));
                o.block = k;
                a.push(o);
            }
        }
        a.sort(function (a, b) { return b.time - a.time; });
        a = a.map(function (a) { return 't=' + a.time + 'ms (avg ' + (a.avg || 0).toFixed(3) + 'ms, max ' + (a.max || 0).toFixed(1) + 'ms) ' + a.frames + ' frames - ' + a.block; });
        a = a.join('\n');
        alert(a);
        self.block = {};
        return a;
    };

    return self;
}());


// file: shuffle.js
// Suffle array randomly
// globals: document, window
// provide: shuffle


CA.shuffle = function (aArray) {
    // Return randomized shallow copy
    var i, j, temp, r = aArray.slice(); // slice is shallow
    for (i = r.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        temp = r[i];
        r[i] = r[j];
        r[j] = temp;
    }
    return r;
};



// file: storage.js
// Simplified access to localStorage with extra checks
// globals: localStorage, window
// provide: storage


CA.storage = (function () {
    var self = {};
    self.ops = 0;

    self.keyExists = function (aKey) {
        // return true if key exists in storage
        if (typeof aKey !== 'string') {
            throw "CA.storage.keyExists key " + aKey + " is not string!";
        }
        try {
            var r = localStorage.hasOwnProperty(aKey);
            return r;
        } catch (e) {
            return false;
        }
    };

    self.removeItem = function (aKey) {
        // erase single key
        if (typeof aKey !== 'string') {
            throw "CA.storage.removeItem(key) - key " + aKey + " is not string!";
        }
        localStorage.removeItem(aKey);
    };

    self.size = function (aKey) {
        // return size of a key's value in bytes
        if (!localStorage.hasOwnProperty(aKey)) {
            return 0;
        }
        var r = localStorage.getItem(aKey).length;
        return r;
    };

    self.humanSize = function (aBytes) {
        // convert 12345 to 12.3 kB
        if (aBytes > 1024 * 1024) {
            return (aBytes / 1024 / 1024).toFixed(1) + ' MB';
        }
        if (aBytes > 1024) {
            return Math.ceil(aBytes / 1024) + ' kB';
        }
        return aBytes + ' B';
    };

    self.sizeAll = function (aHuman) {
        // return size used by entire storage
        var keys = self.keys(), i, t = 0, s = 0;
        for (i = 0; i < keys.length; i++) {
            t += self.size(keys[i]);
        }
        if (aHuman) {
            s = self.humanSize(t);
        } else {
            s = t;
        }
        return s;
    };

    self.keys = function () {
        // return all keys, alphabetically sorted
        var k, keys = [];
        for (k in localStorage) {
            if (localStorage.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys.sort();
    };

    self.removeAll = function (aNothing) {
        // erase entire storage
        if (aNothing !== undefined) {
            throw "CA.storage.removeAll does not require parameter, perhaps you wanted to call CA.storage.removeItem(key)";
        }
        localStorage.clear();
    };

    self.debug = function () {
        // return size occupied by each keys and first few bytes of data
        var i, keys = self.keys().sort(), s = [], c, t = 0;
        for (i = 0; i < keys.length; i++) {
            c = self.size(keys[i]);
            t += c;
            s.push(keys[i] + ': ' + c + ' B = ' + self.readString(keys[i], '').substr(0, 80) + '...');
        }
        s.push('Total size: ' + t + ' B (' + (t / 1000).toFixed(0) + ' kB)');
        s = s.join('\n');
        return s;
    };

    self.readString = function (aKey, aDefault) {
        // read string
        var r;
        if (typeof aKey !== 'string') {
            throw "CA.storage.readString key " + aKey + " is not string!";
        }
        if ((aDefault !== undefined) && (typeof aDefault !== 'string')) {
            throw "CA.storage.readString default " + aDefault + " is not string nor undefined!";
        }
        self.ops++;
        try {
            if (localStorage.hasOwnProperty(aKey)) {
                r = localStorage.getItem(aKey);
            } else {
                r = aDefault;
            }
        } catch (e) {
            console.warn('CA.storage.writeString: ' + e);
        }
        return r;
    };

    self.writeString = function (aKey, aValue) {
        // write string
        if (typeof aKey !== 'string') {
            throw "CA.storage.writeString key " + aKey + " is not string!";
        }
        if ((aValue !== undefined) && (typeof aValue !== 'string')) {
            throw "CA.storage.writeString value " + aValue + " is not string nor undefined!";
        }
        self.ops++;
        try {
            localStorage.setItem(aKey, aValue);
        } catch (e) {
            console.warn('CA.storage.writeString: ' + e);
        }
    };

    self.readBoolean = function (aKey, aDefault) {
        // read true/false, undefined as default, everything else is default with warning
        var s = self.readString(aKey);
        // console.info(aKey, aDefault, s, typeof s);
        if (s === undefined) {
            return aDefault || false;
        }
        if ((s !== 'true') && (s !== 'false')) {
            console.warn('CA.storage.readBoolean: unusual boolean value "' + s + '" for "' + aKey + '", using default');
            return aDefault || false;
        }
        return s === 'true';
    };

    self.writeBoolean = function (aKey, aValue) {
        // write true/false
        if ((aValue !== true) && (aValue !== false)) {
            console.warn('CA.storage.writeBoolean: unusual boolean value "' + aValue + '" for "' + aKey + '", using false');
        }
        var r = aValue === true ? 'true' : 'false';
        self.writeString(aKey, r);
    };

    self.readNumber = function (aKey, aDefault) {
        // read number, undefined as default, everything else is default with warning
        var s = self.readString(aKey), f;
        if (s === undefined) {
            return aDefault || 0;
        }
        f = parseFloat(s);
        if (isNaN(f)) {
            console.warn('CA.storage.readNumber: unusual number value "' + s + '" for "' + aKey + '", using default');
            return aDefault || 0;
        }
        return f;
    };

    self.writeNumber = function (aKey, aValue) {
        // write number
        if (typeof aValue !== 'number') {
            console.warn('CA.storage.writeNumber: unusual number value "' + aValue + '" for "' + aKey + '", using 0');
            self.writeString(aKey, '0');
        } else {
            self.writeString(aKey, aValue.toString());
        }
    };

    self.inc = function (aKey, aDefault) {
        // read number, increment it, write it back
        var i = self.readNumber(aKey, aDefault);
        i++;
        self.writeNumber(aKey, i);
        return i;
    };

    self.readObject = function (aKey, aDefault) {
        // read object, undefined as default, everything else is default with warning
        var s = self.readString(aKey), o;
        if (aDefault === undefined) {
            aDefault = {};
        }
        if (typeof aDefault !== 'object') {
            console.warn('CA.storage.readObject: default is not object in "' + aKey + '" but "' + aDefault + '", using {}');
            aDefault = {};
        }
        if (s === undefined) {
            return aDefault;
        }
        o = JSON.parse(s);
        if (typeof o !== 'object') {
            console.warn('CA.storage.readObject: unusual value "' + s + '" for "' + aKey + '", using default');
            return aDefault;
        }
        return o;
    };

    self.writeObject = function (aKey, aValue) {
        // write object
        if (typeof aValue !== 'object') {
            console.warn('CA.storage.writeObject: unusual object value "' + aValue + '" for "' + aKey + '", using {}');
            self.writeString(aKey, '{}');
        } else {
            self.writeString(aKey, JSON.stringify(aValue));
        }
    };

    self.readArray = function (aKey, aDefault) {
        // read array, undefined as default, everything else is default with warning
        var s = self.readString(aKey), o;
        if (aDefault === undefined) {
            aDefault = [];
        }
        if (!Array.isArray(aDefault)) {
            console.warn('CA.storage.readArray: default is not array in "' + aKey + '" but "' + aDefault + '", using []');
            aDefault = [];
        }
        if (s === undefined) {
            return aDefault;
        }
        o = JSON.parse(s);
        if (!Array.isArray(o)) {
            console.warn('CA.storage.readArray: unusual value "' + s + '" for "' + aKey + '", using default');
            return aDefault;
        }
        return o;
    };

    self.writeArray = function (aKey, aValue) {
        // write array
        if (!Array.isArray(aValue)) {
            console.warn('CA.storage.writeArray: unusual array value "' + aValue + '" for "' + aKey + '", using []');
            self.writeString(aKey, '[]');
        } else {
            self.writeString(aKey, JSON.stringify(aValue));
        }
    };

    return self;
}());


// file: utils/array2d.js
CA.array2d = function (aWidth, aHeight, aValue) {
    // Create 2D array
    var rows = [], row, x, y, f = typeof aValue === 'function';
    for (y = 0; y < aHeight; y++) {
        row = [];
        rows.push(row);
        for (x = 0; x < aWidth; x++) {
            if (f) {
                row.push(aValue(x, y));
            } else {
                row.push(aValue);
            }
        }
    }
    return rows;
};


// file: utils/arrayToObject.js
CA.arrayToObject = function (aArray, aValue, aObject) {
    // create object (or modify given aObject) with property names from array
    var o = aObject || {},
        v = aValue || true;
    aArray.forEach(function (s) {
        o[s] = v;
    });
    return o;
};


// file: utils/beep.js
CA.beep = function (aFrequency, aDuration, aVolume, aShape) {
    // Short beep of given frequency in Hz, duration in ms, volume in percent and shape (sine/square/triangle/sawtooth)
    CA.beepContext = CA.beepContext || new window.AudioContext();
    var freq = aFrequency || 440, duration = aDuration || 200, vol = aVolume || 50,
        oscillator = CA.beepContext.createOscillator(),
        gain = CA.beepContext.createGain();
    oscillator.connect(gain);
    oscillator.frequency.value = freq;
    oscillator.type = aShape || "square";
    gain.connect(CA.beepContext.destination);
    gain.gain.value = vol * 0.01;
    oscillator.start(CA.beepContext.currentTime);
    oscillator.stop(CA.beepContext.currentTime + duration * 0.001);
};

// file: utils/distance.js
CA.distance = function (aX1, aY1, aX2, aY2) {
    // Distance of 2 points
    var dx = aX1 - aX2,
        dy = aY1 - aY2;
    return Math.sqrt(dx * dx + dy * dy);
};


// file: utils/elementsWithId.js
CA.elementsWithId = function () {
    // Return all elements with defined id, if id is set, it is assumed they will be used so we can have them all at once
    function acceptNode() {
        return window.NodeFilter.FILTER_ACCEPT;
    }
    var w = document.createTreeWalker(document.body, window.NodeFilter.SHOW_ELEMENT, acceptNode, false),
        n = w.nextNode(),
        o = {};
    while (n) {
        if (n.id) {
            o[n.id] = n;
        }
        n = w.nextNode();
    }
    return o;
};


// file: utils/focusNext.js
CA.focusNext = function (aElement) {
    // Focus next tab-able element, this doesn't honour tab-indexes
    // find all tab-able elements
    var i, all = Array.from(document.querySelectorAll('input, button, a, area, object, select, textarea, [contenteditable]'));
    // find the current tab index
    i = all.indexOf(aElement);
    // focus the following element
    i = (i + 1) % all.length;
    all[i].focus();
    if (all[i].select) {
        all[i].select();
    }
    return all[i];
};


// file: utils/randomInt.js
CA.randomInt = function (aMin, aMax) {
    // Random int from given range, including extremes
    return Math.floor(Math.random() * (aMax - aMin + 1)) + aMin;
};


// file: utils/randomItem.js
CA.randomItem = function (aArray) {
    // Random item from array
    return aArray[Math.floor(aArray.length * Math.random())];
};


// file: utils/reduceColors.js
CA.reduceColors = function (aCanvas, aColorsPerChannel) {
    // Reduce canvas colors
    aColorsPerChannel = aColorsPerChannel || 128;
    var i,
        q = Math.floor(256 / aColorsPerChannel),
        d = aCanvas.context.getImageData(0, 0, aCanvas.width, aCanvas.height),
        dd = d.data;
    for (i = 0; i < dd.length; i++) {
        dd[i] = q * Math.round(dd[i] / q);
    }
    aCanvas.context.putImageData(d, 0, 0);
    return aCanvas.toDataURL().length;
};



// file: utils/removeClass.js
CA.removeClass = function (aClassName) {
    // Remove class from elements with this class
    var i, e = document.getElementsByClassName(aClassName);
    for (i = e.length - 1; i >= 0; i--) {
        e[i].classList.remove(aClassName);
    }
};


// file: utils/unused.js
CA.unused = function () {
    // Function to suppress linter warnings
    return;
};


// file: utils/urlParams.js
CA.urlParams = function () {
    // Get url parameters as associative array
    var i, o = {}, s = document.location.search.substr(1).split(/[\&\=]/);
    for (i = 0; i < s.length; i += 2) {
        o[s[i]] = s[i + 1];
    }
    return o;
};


// file: undo.js
// Universal undo
// globals: document, window


CA.Undo = function (aObject, aLimit, aIntervalSeconds) {
    var t = this, last = '', k;
    this.verbose = true;

    // check object (must be assoc array of persistentable objects - has toObject, fromObject)
    if (typeof aObject !== 'object' || Array.isArray(aObject)) {
        throw "Undo object must be object of objects, not array";
    }
    for (k in aObject) {
        if (aObject.hasOwnProperty(k)) {
            if (typeof aObject[k].toObject !== 'function') {
                throw "Undo object." + k + " has no toObject() function";
            }
            if (typeof aObject[k].fromObject !== 'function') {
                throw "Undo object." + k + " has no fromObject(obj) function";
            }
        }
    }

    this.obj = aObject;
    this.changed = false;
    this.stack = [];
    this.limit = aLimit || 10;
    // first snapshot
    this.push();

    // take snapshot ever 10 seconds (if it changed)
    window.setInterval(function () {
        if (t.verbose) {
            console.log('undo interval, stack length ', t.stack.length);
        }
        var cur = t.snapshot();
        if (cur !== last) {
            if (t.verbose) {
                console.log('undo pushed', last.length);
            }
            last = cur;
            t.push();
            if (t.stack.length > t.limit) {
                t.stack.shift();
            }
        }


    }, (aIntervalSeconds || 10) * 1000);
};

CA.Undo.prototype.snapshot = function () {
    // Create one string snapshot from object
    var k, o = {};
    for (k in this.obj) {
        if (this.obj.hasOwnProperty(k)) {
            o[k] = this.obj[k].toObject();
        }
    }
    return JSON.stringify(o);
};

CA.Undo.prototype.push = function () {
    // Push one snapshot into stack
    this.stack.push(this.snapshot());
};

CA.Undo.prototype.pop = function () {
    // Pop one copy from stack
    var o, k, old = this.stack.length;
    if (this.stack.length === 1) {
        o = JSON.parse(this.stack[0]);
    } else {
        o = JSON.parse(this.stack.pop());
    }
    // revive object
    for (k in o) {
        if (o.hasOwnProperty(k)) {
            this.obj[k].fromObject(o[k]);
        }
    }
    return this.stack.length < old;
};

CA.Undo.prototype.isEmpty = function () {
    // Return true if undo is not possible
    return this.stack.length <= 0;
};

CA.Undo.prototype.size = function () {
    // Return approximate undo stack size in bytes
    return this.stack.reduce(function (a, b) {
        return b.length + a;
    }, 0);
};

// file: viewport.js
// Canvas viewport with zoom and pan
// globals: document, window
// require: none
// provide: Viewport


CA.Viewport = function (aCanvas, aRenderCallback) {
    // Constructor
    var t = this, pan = false, pan_start;
    t.canvas = typeof aCanvas === 'string' ? document.getElementById(aCanvas) : aCanvas;
    t.x = 0;
    t.y = 0;
    t.zoom = 1;
    t.zoom_enabled = true;

    t.canvas.addEventListener('wheel', function (event) {
        // Mouse wheel zooms in/out
        if (!t.zoom_enabled) {
            return;
        }
        if (Math.abs(event.deltaY) === 0) {
            return;
        }
        var c = t.screenToCanvas(event.clientX, event.clientY), d;
        t.zoom += event.deltaY < 0 ? 1 : -1;
        if (t.zoom < 1) {
            t.zoom = 1;
        }
        d = t.canvasToScreen(c.x, c.y);
        t.x -= Math.round(d.x - event.clientX);
        t.y -= Math.round(d.y - event.clientY);
        aRenderCallback();
        if (t.onzoom) {
            t.onzoom(t);
        }
    });

    t.canvas.addEventListener('mousedown', function (event) {
        // Start of pan
        if (event.which === 2) {
            pan = true;
            pan_start = {x: event.clientX, y: event.clientY};
            t.canvas.style.cursor = 'move';
        }
    });

    t.canvas.addEventListener('mousemove', function (event) {
        // Continue pan
        var p;
        if (pan) {
            p = {x: event.clientX, y: event.clientY};
            t.x += (p.x - pan_start.x);
            t.y += (p.y - pan_start.y);
            t.x = Math.round(t.x);
            t.y = Math.round(t.y);
            pan_start = p;
            aRenderCallback();
            return;
        }
    });

    window.addEventListener('mouseup', function () {
        // End of pan
        pan = false;
        t.canvas.style.cursor = 'default';
    });
};

CA.Viewport.prototype.toObject = function () {
    // Return exportable object
    return {
        x: this.x,
        y: this.y,
        zoom: this.zoom
    };
};

CA.Viewport.prototype.fromObject = function (aObject) {
    // Set this from previously exported object
    this.x = aObject.x;
    this.y = aObject.y;
    this.zoom = aObject.zoom;
};

CA.Viewport.prototype.canvasToScreen = function (aX, aY) {
    // Convert canvas coordinates to screen coordinates
    return {
        x: this.x + aX * this.zoom,
        y: this.y + aY * this.zoom
    };
};

CA.Viewport.prototype.screenToCanvas = function (aX, aY, aRound) {
    // Convert screen coordinates to canvas coordinates
    var x = (aX - this.x) / this.zoom,
        y = (aY - this.y) / this.zoom;
    if (aRound) {
        return {x: Math.round(x), y: Math.round(y)};
    }
    return {x: x, y: y};
};

CA.Viewport.prototype.centerTo = function (aX, aY) {
    // Center viewport to make specific coordinates in the center of viewport
    this.x = Math.round(-aX * this.zoom + this.canvas.width / 2);
    this.y = Math.round(-aY * this.zoom + this.canvas.height / 2);
};

// file: z_index.js
// Get highest zIndex value
// globals: document, window, NodeFilter
// provide: zIndex


CA.zIndex = (function () {
    var self = {}, f = 0;

    self.fast = function () {
        // Get next highest z-index fast
        f++;
        return f;
    };

    self.slow = function () {
        // returns real highest used zIndex plus 1
        if (!document.body) {
            return self.fast();
        }
        function acceptNode() {
            return NodeFilter.FILTER_ACCEPT;
        }
        var ie11 = (CA.browser.msie && CA.browser.version <= 11),
            w = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, ie11 ? acceptNode : null, false),
            n,
            cur,
            m = 0,
            v = window.document.defaultView;
        n = w.nextNode();
        while (n) {
            if (n instanceof window.HTMLElement) {
                cur = parseInt(v.getComputedStyle(n).getPropertyValue('z-index'), 10);
                if (cur > m) {
                    m = cur;
                }
            }
            n = w.nextNode();
        }
        return m + 1;
    };

    return self;
}());

