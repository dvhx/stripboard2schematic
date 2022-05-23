// Cache rotated and mirrored images of components (8 images for each component, 4 rotation * 2 mirror)
"use strict";
// globals: document, window, CA

var SC = window.SC || {};

SC.rotateAndMirror = function (aRotate, aMirror, aX, aY, aWidth, aHeight) {
    // Calculate rotate and mirror transformation for single point in image
    var x, y, l, angle, angle2, x2, y2, q;
    q = 0;
    if (aRotate === 3 && aMirror) {
        q = aWidth - aHeight;
    }
    if (aRotate === 1) {
        aHeight = aWidth;
    } else if (aRotate === 3) {
        aWidth = aHeight;
    }
    x = aX - aWidth / 2;
    y = aY - aHeight / 2;
    l = Math.sqrt(x * x + y * y);
    angle = Math.atan2(y, x);
    angle2 = angle + Math.PI * aRotate / 2;
    x2 = l * Math.cos(angle2);
    y2 = l * Math.sin(angle2);
    //console.log({x,y,angle,angle2,l,x2,y2});
    return {
        x: Math.round((aWidth / 2 + (aMirror ? -1 : 1) * x2 + q) / SC.gridSize),
        y: Math.round((aHeight / 2 + y2) / SC.gridSize)
    };
};

SC.loadImagesAndTransform = function (aPins, aCallback) {
    // Load all images specified in aPins and make all 8 rotate/mirror combinations
    var src = Object.keys(aPins).map(function (a) { return 'image/schematic/' + a + '.png'; });

    CA.images(src, function (aImages) {
        var k, type;

        function one(aImage, aMirror, aRotate) {
            // Load one image and make 8 canvases
            var w, h, can, ctx, x, y;
            w = aImage.width;
            h = aImage.height;
            if (aRotate % 2 === 1) {
                w = aImage.height;
                h = aImage.width;
            }
            can = document.createElement('canvas');
            can.width = w;
            can.height = h;
            ctx = can.getContext('2d');
            ctx.fillStyle = 'silver';
            if (SC.grayComponents) {
                ctx.fillRect(0, 0, w, h);
            }
            x = 0;
            y = 0;
            if (aMirror) {
                ctx.scale(-1, 1);
            }
            switch (aRotate) {
            case 0:
                ctx.rotate(aRotate * Math.PI / 2);
                if (aMirror) {
                    x = -w;
                    y = 0;
                }
                ctx.drawImage(aImage, x, y);
                break;
            case 1:
                ctx.rotate(aRotate * Math.PI / 2);
                if (aMirror) {
                    x = 0;
                    y = w;
                }
                ctx.drawImage(aImage, x, -w + y);
                break;
            case 2:
                ctx.rotate(aRotate * Math.PI / 2);
                if (aMirror) {
                    x = w;
                    y = 0;
                }
                ctx.drawImage(aImage, -w + x, -h + y);
                break;
            case 3:
                ctx.rotate(aRotate * Math.PI / 2);
                if (aMirror) {
                    x = 0;
                    y = -w;
                }
                ctx.drawImage(aImage, -h + x, y);
                break;
            }
            return can;
        }

        for (k in aImages) {
            if (aImages.hasOwnProperty(k)) {
                type = k.replace('image/schematic/', '').replace('.png', '');
                SC.image[type] = {
                    0: one(aImages[k], false, 0),
                    1: one(aImages[k], false, 1),
                    2: one(aImages[k], false, 2),
                    3: one(aImages[k], false, 3),
                    10: one(aImages[k], true, 0),
                    11: one(aImages[k], true, 1),
                    12: one(aImages[k], true, 2),
                    13: one(aImages[k], true, 3)
                };
            }
        }

        aCallback();
    });
};
