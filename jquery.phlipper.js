/*******************************
 * jquery.phlipper.js
 * A jQuery-plugin, a tool to show cards with words and flip them to show text
 * on the other side.
 * Petri Salmela <pesasa@iki.fi>
 *******************************/

;(function($){

    var Phlipper = function(place, options){
        this.place = $(place);
        this.setStyles();
        this.init(options);
        this.setMode(this.settings.mode);
        this.setAttrs();
        this.show();
    };
    
    Phlipper.prototype.init = function(options){
        options = $.extend(true, {}, Phlipper.defaults, options);
        this.cards = [];
        this.config = options.config;
        this.settings = options.settings;
        var cardData;
        for (var i = 0, len = options.cards.length; i < len; i++){
            cardData = options.cards[i];
            this.cards.push(new PhlipCard(cardData));
        };
    };
    
    Phlipper.prototype.setAttrs = function() {
        this.place
            .addClass('wordphlipper-wrapper');
        if (this.settings.fullscreen) {
            this.place.addClass('wordphlipper-fullscreen');
        }
    };
    
    Phlipper.prototype.setMode = function(mode){
        mode = (Phlipper.modes[mode] ? mode : this.settings.mode || 'view');
        this.settings.mode = mode;
        this.editable = Phlipper.modes[mode].editable;
        this.place.attr('data-mode', this.settings.mode);
        if (this.editable) {
            this.place.addClass('wordphlipper-editmode');
            this.place.removeClass('wordphlipper-viewmode');
        } else {
            this.place.addClass('wordphlipper-viewmode');
            this.place.removeClass('wordphlipper-editmode');
        };
    };
    
    Phlipper.prototype.setStyles = function() {
        if ($('head style#phlipper-styles').length === 0) {
            $('head').append('<style id="phlipper-styles" type="text/css">' + Phlipper.style + '</style>');
        };
    };
    
    Phlipper.prototype.show = function(){
        this.initHandlers();
        if (this.editable) {
            this.edit();
        } else {
            this.view();
        };
        this.place.find('ul.wordphlipper-list').css({fontSize: this.config.size + 'px'});
        this.place.trigger('updatedownload');
    };
    
    Phlipper.prototype.view = function(){
        this.place.html(Phlipper.templates.view);
        this.addButtons();
        this.addConfigs();
        var cardlist = this.place.find('.wordphlipper-list');
        var card;
        for (var i = 0, len = this.cards.length; i < len; i++){
            card = this.cards[i];
            cardlist.append('<li class="wordphlipper-carditem">'+card.getHtml('view')+'</li>');
        };
    };
    
    Phlipper.prototype.edit = function(){
        this.place.html(Phlipper.templates.edit);
        this.addButtons();
        this.addControls();
        this.addConfigs();
        var cardlist = this.place.find('.wordphlipper-list');
        var card;
        for (var i = 0, len = this.cards.length; i < len; i++){
            card = this.cards[i];
            cardlist.append('<li class="wordphlipper-carditem" data-cardindex="'+i+'">'+card.getHtml('edit')+'</li>');
        };
    };
    
    Phlipper.prototype.addButtons = function(){
        var buttonplace = this.place.find('.wordphlipper-buttonarea');
        var button, classnames, mode = this.settings.mode;
        for (var i = 0, len = Phlipper.buttons.length; i < len; i++){
            button = Phlipper.buttons[i];
            classnames = '';
            if (button.classnames) {
                classnames = ' ' + button.classnames.join(' ');
            };
            if (button.mode[mode]) {
                switch (button.type) {
                    case 'fileopen':
                        buttonplace.prepend('<label><span class="wordphlipper-button wordphlipper-button-file" title="'+button.label+'" data-event="'+button.event+'">'+button.icon+'</span><input class="wordphlipper-hidden'+classnames+'" type="file" /></label>');
                        break;
                    case 'filesave':
                        buttonplace.prepend('<a href="javascript:;" download="wordphlipper.json" class="wordphlipper-button wordphlipper-button-file'+classnames+'" title="'+button.label+'" data-event="'+button.event+'">'+button.icon+'</a>');
                        break;
                    case 'button':
                    default:
                        buttonplace.prepend('<span class="wordphlipper-button'+classnames+'" title="'+button.label+'" data-event="'+button.event+'">'+button.icon+'</span>');
                        break;
                }
            }
        };
    };
    
    Phlipper.prototype.addControls = function(){
        var controlplace = this.place.find('.wordphlipper-controlarea');
        var control, classnames;
        for (var i = 0, len = Phlipper.controls.length; i < len; i++){
            control = Phlipper.controls[i];
            classnames = '';
            if (control.classnames) {
                classnames = ' ' + control.classnames.join(' ');
            };
            switch (control.type){
                case 'dragbutton':
                    controlplace.append('<span class="wordphlipper-button wordphlipper-dragbutton'+classnames+'" title="'+control.label+'" draggable="true" data-event="'+control.event+'">'+control.icon+'</span>');
                    break;
                case 'button':
                default:
                    controlplace.append('<span class="wordphlipper-button'+classnames+'" title="'+control.label+'" data-event="'+control.event+'">'+control.icon+'</span>');
                    break;
            };
        };
    };
    
    Phlipper.prototype.addConfigs = function(){
        var confplace = this.place.find('.wordphlipper-configarea');
        var config, mode = this.settings.mode;
        for (var i = 0, len = Phlipper.configs.length; i < len; i++){
            config = Phlipper.configs[i];
            if (config.mode[mode]) {
                switch (config.type){
                    case 'range':
                        confplace.append('<input type="range" min="'+config.min+'" max="'+config.max+'" value="'+this.config.size+'" data-confname="'+config.name+'" class="wordphlipper-configinput" />')
                        break;
                    default:
                        break;
                };
            };
        };
    };
    
    Phlipper.prototype.addCard = function(index){
        if (!(typeof(index) === 'number' && isFinite(index))) {
            index = this.cards.length;
        }
        var card = new PhlipCard();
        this.cards.splice(index, 0, card);
        this.changed();
        this.show();
        this.setFocus(index);
    }
    
    Phlipper.prototype.removeAll = function(){
        this.cards = [];
        this.changed();
        this.show();
    }
    
    Phlipper.prototype.removeCard = function(index){
        if (typeof(index) === 'number' && isFinite(index) && index >= 0 && index < this.cards.length) {
            this.cards.splice(index, 1);
            this.changed();
            this.show();
        };
    };
    
    Phlipper.prototype.moveCard = function(from, to){
        var count = this.cards.length;
        var moving;
        if (typeof(from) === 'number' && isFinite(from) && typeof(to) === 'number' && isFinite(to) &&
            from >= 0 && to >= 0 && from < count && to < count && from !== to) {
            moving = this.cards.splice(from, 1);
            this.cards.splice(to, 0, moving[0]);
        };
        this.changed();
        this.show();
        this.setFocus(to);
    }
    
    Phlipper.prototype.setFocus = function(index){
        this.place.find('li.wordphlipper-carditem[data-cardindex="'+index+'"] input.phlipcard-wordinput').focus();
    };
    
    Phlipper.prototype.setWord = function(word, index){
        var card;
        if (typeof(index) === 'number' && index >= 0 && index < this.cards.length) {
            card = this.cards[index];
            card.setWord(word);
            this.changed();
        };
    };
    
    Phlipper.prototype.setContent = function(data, index){
        var card;
        if (typeof(index) === 'number' && index >= 0 && index < this.cards.length) {
            card = this.cards[index];
            card.setContent(data);
            this.changed();
        };
    };
    
    Phlipper.prototype.setConfig = function(name, value){
        this.config[name] = value;
        this.changed();
        this.show();
    }
    
    Phlipper.prototype.getData = function(){
        var result = {
            cards: [],
            config: $.extend(true, {}, this.config)
        };
        for (var i = 0, len = this.cards.length; i < len; i++){
            result.cards.push(this.cards[i].getData());
        };
        return result;
    };
    
    Phlipper.prototype.changed = function(){
        this.place.trigger('updatedownload');
    };
    
    Phlipper.prototype.removeHandlers = function(){
        this.place.off();
    }
    
    Phlipper.prototype.initHandlers = function() {
        this.removeHandlers();
        this.initHandlersCommon();
        if (this.editable) {
            this.initHandlersEdit();
        } else {
            this.initHandlersView();
        };
    };
    
    Phlipper.prototype.initHandlersCommon = function(){
        var phlip = this;
        this.place.on('click', '.wordphlipper-button', function(event, data){
            var button = $(this);
            var action = button.attr('data-event');
            button.trigger(action);
        });
        this.place.on('dragstart', '.wordphlipper-dragbutton', function(event, data){
            event.stopPropagation();
            var button = $(this);
            var action = button.attr('data-event');
            var dragdata = '{"action": "'+action+'"}';
            var ev = event.originalEvent;
            ev.dataTransfer.setData('text', dragdata);
            ev.dataTransfer.effectAllowed = 'copy';
        });
        this.place.on('setmodeview', function(event, data){
            event.stopPropagation();
            phlip.setMode('view');
            phlip.show();
        });
        this.place.on('setmodeedit', function(event, data){
            event.stopPropagation();
            phlip.setMode('edit');
            phlip.show();
        });
        this.place.on('addcard', function(event, data){
            event.stopPropagation();
            var index = phlip.cards.length;
            phlip.addCard(index);
        });
        this.place.on('removecard', function(event, data){
            event.stopPropagation();
            var element = $(event.target);
            var index = element.closest('li.wordphlipper-carditem').attr('data-cardindex') | 0;
            phlip.removeCard(index);
        });
        this.place.on('removeall', function(event, data){
            event.stopPropagation();
            var sure = confirm('Removing all cards!\nAre you sure?');
            if (sure) {
                phlip.removeAll();
            }
        });
        this.place.on('updatedownload', function(event, data){
            event.stopPropagation();
            var button = phlip.place.find('.wordphlipper-downloadbutton');
            var savedata = phlip.getData();
            var json = JSON.stringify(savedata, null, 4);
            var blob = new Blob([json], {type: 'application/json'});
            var url = window.URL.createObjectURL(blob);
            button.attr('href', url);
        });
        this.place.on('change', '.wordphlipper-configinput', function(event, data){
            event.stopPropagation();
            var input = $(this);
            var value = input.val();
            var name = input.attr('data-confname');
            phlip.setConfig(name, value);
        });
        this.place.on('change', '.wordphlipper-loadfileinput', function(event, data){
            var thefile = event.target.files[0];
            if (thefile.type === 'application/json' || thefile.type === '') {
                var reader = new FileReader();
                reader.onload = function(ev){
                    var json;
                    try {
                        json = JSON.parse(ev.target.result);
                    } catch (err){
                        json = {};
                        console.log('parse error: ', err);
                    };
                    if (json.cards && typeof(json.cards.length) === 'number') {
                        json.settings = {mode: phlip.settings.mode};
                        phlip.init(json);
                        phlip.setMode();
                        phlip.show();
                    } else {
                        alert('Invalid file.\nSorry!');
                    };
                };
                reader.readAsText(thefile);
            };
        });
    };
    
    Phlipper.prototype.initHandlersView = function(){
        var phlip = this;
        this.place.on('click', '.phlipcard', function(event, data){
            event.stopPropagation();
            event.preventDefault();
            var card = $(this);
            card.toggleClass('phlipcard-isflipped');
        });
    };

    Phlipper.prototype.initHandlersEdit = function(){
        var phlip = this;
        this.place.on('change', '.phlipcard-wordinput', function(event, data){
            event.stopPropagation();
            var input = $(this);
            var value = input.val();
            var index = input.closest('li.wordphlipper-carditem').attr('data-cardindex') | 0;
            phlip.setWord(value, index);
        });
        this.place.on('change', '.phlipcard-contentinput', function(event, data){
            event.stopPropagation();
            var input = $(this);
            var value = input.val();
            var index = input.closest('li.wordphlipper-carditem').attr('data-cardindex') | 0;
            phlip.setContent(value, index);
        });
        this.place.on('click', '.phlipcard-trashicon', function(event, data){
            event.stopPropagation();
            var item = $(this);
            var action = item.attr('data-event');
            item.trigger(action);
        });
        this.place.on('dragstart', '.phlipcard-dragicon', function(event, data){
            event.stopPropagation();
            var item = $(this);
            var action = item.attr('data-event');
            var litem = item.closest('li.wordphlipper-carditem');
            litem.addClass('wordphlipper-movingthiscard');
            var from = litem.attr('data-cardindex');
            var dragdata = '{"action": "'+action+'", "from": '+from+'}';
            var ev = event.originalEvent;
            ev.dataTransfer.setData('text', dragdata);
            ev.dataTransfer.effectAllowed = 'copy';
        });
        this.place.on('drop', '.phlipcard input, .phlipcard textarea', function(event, data){
            event.preventDefault();
        });
        this.place.on('drop', function(event, data){
            event.preventDefault();
            phlip.place.find('.wordphlipper-movingthiscard');
        });
        this.place.on('dragenter', 'li.wordphlipper-carditem', function(event, data){
            $(this).addClass('wordphlipper-draggingover');
        });
        this.place.on('dragleave', 'li.wordphlipper-carditem', function(event, data){
            $(this).removeClass('wordphlipper-draggingover');
        });
        this.place.on('dragover', '.phlipcard', function(event, data){
            event.preventDefault();
        });
        this.place.on('dragover', '.wordphlipper-header', function(event, data){
            event.preventDefault();
            // TODO: What element to scroll? window or something else?
            $(window).scrollTop(Math.max(0, $(window).scrollTop()-10));
        });
        this.place.on('dragover', '.wordphlipper-bottomdragdown', function(event, data){
            event.preventDefault();
            // TODO: What element to scroll? window or something else?
            $(window).scrollTop($(window).scrollTop()+10);
        });
        this.place.on('drop', '.phlipcard', function(event, data){
            event.stopPropagation();
            event.preventDefault();
            var card = $(this);
            var index = card.closest('li.wordphlipper-carditem').attr('data-cardindex') | 0;
            var ev = event.originalEvent;
            var datastr = ev.dataTransfer.getData('text');
            var jsondata;
            try {
                jsondata = JSON.parse(datastr);
            } catch(err) {
                jsondata = {action: 'error'};
            };
            switch (jsondata.action){
                case 'addcard':
                    phlip.addCard(index);
                    break;
                case 'movecard':
                    if (typeof(jsondata.from) === 'number') {
                        phlip.moveCard(jsondata.from, index);
                    };
                    break;
                default:
                    break;
            };
            phlip.place.trigger('dragend');
        });
    };

    Phlipper.defaults = {
        cards: [],
        config: {
            size: 20
        },
        settings: {
            mode: 'view',
            fullscreen: true
        }
    }
    
    Phlipper.modes = {
        view: {
            editable: false
        },
        edit: {
            editable: true
        }
    };
    
    Phlipper.buttons = [
        {
            name: 'View',
            label: 'View',
            type: 'button',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="30" height="30" viewBox="0 0 30 30" class="pssicon pssicon-view"><path style="stroke: none;" d="M3 15 a13 13 0 0 0 24 0 a13 13 0 0 0 -24 0z m1 0 a13 13 0 0 1 22 0 a13 13 0 0 1 -22 0z m6 0 a5 5 0 0 0 10 0 a5 5 0 0 0 -2.2 -4 l-2.8 4 l0 -5 a5 5 0 0 0 -5 5z"></path></svg>',
            event: 'setmodeview',
            mode: {
                edit: true
            }
        },
        {
            name: 'Edit',
            label: 'Edit',
            type: 'button',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="30" height="30" viewBox="0 0 30 30" class="pssicon pssicon-edit"><path style="stroke: none;" d="M3 27 l10 -4 l15 -15 a7 7 0 0 0 -6 -6 l-15 15z m5 -2.4 a3 3 0 0 0 -2.6 -2.6 l2 -5 a8 8 0 0 1 5.6 5.6 z"></path></svg>',
            event: 'setmodeedit',
            mode: {
                view: true
            }
        },
        {
            name: 'Save',
            label: 'Save',
            type: 'filesave',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="30" height="30" viewBox="0 0 30 30" class="pssicon pssicon-save pssicon-disk"><path style="stroke: none;" d="M1 1 l23 0 l5 5 l0 23 l-28 0z m5 2 l0 8 l17 0 l0 -8z m12 1 l3 0 l0 6 l-3 0z m-13 10 l0 14 l20 0 l0 -14z m3 3 l14 0 l0 2 l-14 0z m0 3 l14 0 l0 2 l-14 0z m0 3 l14 0 l0 2 l-14 0z"></path></svg>',
            event: 'savedata',
            classnames: ['wordphlipper-downloadbutton'],
            mode: {
                edit: true,
                view: true
            }
        },
        {
            name: 'Load',
            label: 'Load',
            type: 'fileopen',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="30" height="30" viewBox="0 0 30 30" class="pssicon pssicon-folder pssicon-open"><path style="stroke: none;" d="M2 6 l7 0 l1 2 l13 0 l0 2 l-16 0 l-4 14 l5 -12 l21 0 l-5 13 -22 0z"></path></svg>',
            event: 'loaddata',
            classnames: ['wordphlipper-loadfileinput'],
            mode: {
                edit: true,
                view: true
            }
        }
    ];
    
    Phlipper.controls = [
        {
            name: 'addcard',
            label: 'Add card',
            type: 'dragbutton',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="30" height="30" viewBox="0 0 30 30" class="pssicon pssicon-newdocument"><path style="stroke: none;" d="M3 1 l18 0 l6 6 l0 22 l-24 0z m1 1 l0 26 l22 0 l0 -21 l-5 0 l0 -5z m8 8 a1 1 0 0 1 1 -1 l4 0 a1 1 0 0 1 1 1 l0 4 l4 0 a1 1 0 0 1 1 1 l0 4 a1 1 0 0 1 -1 1 l-4 0 l0 4 a1 1 0 0 1 -1 1 l-4 0 a1 1 0 0 1 -1 -1 l0 -4 l-4 0 a1 1 0 0 1 -1 -1 l0 -4 a1 1 0 0 1 1 -1 l4 0z"></path></svg>',
            event: 'addcard'
        },
        {
            name: 'removeall',
            label: 'Remove all cards',
            type: 'button',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="30" height="30" viewBox="0 0 30 30" class="pssicon pssicon-move pssicon-drag"><path style="stroke: none;" d="M7 10 l16 0 l0 16 a3 3 0 0 1 -3 3 l-10 0 a3 3 0 0 1 -3 -3z m2.5 4 l0 11 a1 1 0 0 0 2 0 l0 -11 a1 1 0 0 0 -2 0z m4.5 0 l0 11 a1 1 0 0 0 2 0 l0 -11 a1 1 0 0 0 -2 0z m4.5 0 l0 11 a1 1 0 0 0 2 0 l0 -11 a1 1 0 0 0 -2 0z m-13.5 -5 a3 3 0 0 1 3 -3 l14 0 a3 3 0 0 1 3 3z m7 -4 a2 2 0 0 1 2 -2 l2 0 a2 2 0 0 1 2 2z"></path></svg>',
            classnames: ['wordphlipper-removeall'],
            event: 'removeall'
        }
    ];
    
    Phlipper.configs = [
        {
            name: 'size',
            lagel: 'Size',
            type: 'range',
            min: 12,
            max: 50,
            mode: {
                edit: true,
                view: true
            }
        }
    ]
    
    Phlipper.style = [
        '.wordphlipper-wrapper {border: 1px solid black;}',
        '.wordphlipper-hidden {display: none;}',
        '.wordphlipper-header {font-size: 170%; min-height: 2em; background-color: #a00; display: flex; flex-direction: row; flex-wrap: nowrap; justify-content: space-between; align-items: stretch; align-content: flex-start;}',
        '.wordphlipper-fullscreen .wordphlipper-header {position: fixed; top: 0; left: 0; right: 0; z-index: 3;  padding-right: 120px;}',
        '.wordphlipper-header .wordphlipper-title {font-weight: bold; color: white; text-shadow: 1px 1px 0 black, 1px -1px 0 black, -1px -1px 0 black, -1px 1px 0 black; padding: 0.5em;}',
        '.wordphlipper-header .wordphlipper-buttonarea {margin: 0.2em 0.5em;}',
        '.wordphlipper-header .wordphlipper-buttonarea label {margin: 0; padding: 0;}',
        '.wordphlipper-header .wordphlipper-controlarea, .wordphlipper-header .wordphlipper-configarea {margin: 0.2em 0.5em}',
        '.wordphlipper-header .wordphlipper-button {margin: 0 0.2em; padding: 4px; background-color: #eee; display: inline-block; min-width: 30px; min-height: 30px; vertical-align: middle; text-align: center; line-height: 30px; border-radius: 4px; box-shadow: inset -1px -1px 2px rgba(0,0,0,0.6), inset 1px 1px 2px rgba(255,255,255,0.5); cursor: pointer;}',
        '.wordphlipper-header .wordphlipper-button:active {box-shadow: inset 1px 1px 2px rgba(0,0,0,0.6), inset -1px -1px 2px rgba(255,255,255,0.5); background-color: #ddd;}',
        '.wordphlipper-header .wordphlipper-dragbutton {cursor: move;}',
        '.wordphlipper-list {list-style: none; margin: 0; padding: 0; display: flex; flex-direction: row; flex-wrap: wrap; justify-content: flex-start; align-items: stretch; align-content: flex-start;}',
        '.wordphlipper-fullscreen .wordphlipper-cardarea {margin: 4.3em 2em 3em;}',
        'li.wordphlipper-carditem {margin: 0.2em; width: 11em; perspective: 1000px;}',
        '.wordphlipper-viewmode li.wordphlipper-carditem {margin: 0.2em; width: 11em; height: 11em; perspective: 1000px;}',
        '.phlipcard {position: relative;}',
        '.wordphlipper-viewmode .phlipcard {cursor: pointer; transition: transform 0.6s; transform-style: preserve-3d;}',
        '.phlipcard.phlipcard-isflipped { width: 11em; height: 11em; transform: rotateY(180deg); box-shadow: 0 0.5em 1em rgba(0,0,0,0.3); border-radius: 0.5em;}',
        '.phlipcard-front, .phlipcard-back {height: 10em; width: 10em; border: 1px solid #555; border-radius: 0.5em; padding: 0.5em; backface-visibility: hidden; background-color: #f0f0f0;}',
        '.phlipcard-front {line-height: 10em; text-align: center; z-index: 2; box-shadow: inset 0 0 5em rgba(0,0,0,0.2);}',
        '.phlipcard-back {white-space: pre-wrap; white-space: -moz-pre-wrap; white-space: -pre-wrap; white-space: -o-pre-wrap; word-wrap: break-word; overflow: hidden;}',
        '.wordphlipper-viewmode .phlipcard-front { transform: rotateY(0deg); position: absolute; top: 0; left: 0;}',
        '.wordphlipper-viewmode .phlipcard-back { transform: rotateY(180deg); position: absolute; top: 0; left: 0;}',
        '.phlipcard-word {display: inline-block; line-height: 1.2em; vertical-align: middle; text-align: center; font-size: 1.8em; font-weight: bold;}',
        
        // Editing
        '.phlipcard-wordinput {width: 99%; font-size: 1em; text-align: center; background-color: white; border: 1px solid #666; border-radius: 0.3em;}',
        '.phlipcard-contentinput {display: block; box-sizing: content-box; width: 100%; height: 10em; font-size: 90%;}',
        'li.wordphlipper-carditem.wordphlipper-draggingover {background-color: #faa; box-shadow: -5px -5px 10px #faa, 5px 5px 10px #faa;}',
        'li.wordphlipper-carditem.wordphlipper-movingthiscard {opacity: 0.5;}',
        '.phlipcard-dragicon {position: absolute; top: 5px; left: 5px; height: 30px; width: 30px; line-height: 30px; cursor: move; border: 1px solid transparent; padding: 2px;}',
        '.phlipcard-dragicon:hover {background-color: rgba(255,255,255,0.6); border: 1px solid #777; border-radius: 50%;}',
        '.phlipcard-trashicon {position: absolute; top: 5px; right: 5px; height: 30px; width: 30px; line-height: 30px; cursor: pointer; border: 1px solid transparent; padding: 2px;}',
        '.phlipcard-trashicon:hover {background-color: rgba(255,255,255,0.6); border: 1px solid #777; border-radius: 50%;}',
        '.wordphlipper-fullscreen .wordphlipper-bottomdragdown {position: fixed; bottom: 0; left: 0; right: 0; height: 2em; background-color: #a00;}',
        '.wordphlipper-button.wordphlipper-removeall {margin-left: 1em; margin-right: 1em;}'
    ].join('\n');
    
    Phlipper.templates = {
        view: [
            '<div class="wordphlipper-header">',
            '    <div class="wordphlipper-title">WordPhlipper</div>',
            '    <div class="wordphlipper-configarea"></div>',
            '    <div class="wordphlipper-buttonarea"></div>',
            '</div>',
            '<div class="wordphlipper-cardarea">',
            '    <ul class="wordphlipper-list">',
            '    </ul>',
            '</div>'
        ].join('\n'),
        edit: [
            '<div class="wordphlipper-header">',
            '    <div class="wordphlipper-title">WordPhlipper</div>',
            '    <div class="wordphlipper-controlarea"></div>',
            '    <div class="wordphlipper-configarea"></div>',
            '    <div class="wordphlipper-buttonarea"></div>',
            '</div>',
            '<div class="wordphlipper-cardarea">',
            '    <ul class="wordphlipper-list">',
            '    </ul>',
            '</div>',
            '<div class="wordphlipper-bottomdragdown"></div>'
        ].join('\n')
    };
    
    
    var PhlipCard = function(options){
        options = $.extend(true, {}, PhlipCard.defaults, options);
        this.init(options);
    }
    
    PhlipCard.prototype.init = function(options){
        this.title = options.title;
        this.text = options.text;
        this.image = options.image;
        this.isimage = options.isimage;
    }
    
    PhlipCard.prototype.setWord = function(word){
        this.title = word;
    }
    
    PhlipCard.prototype.setContent = function(data){
        this.text = data;
    }
    
    PhlipCard.prototype.getHtml = function(mode){
        mode = (mode === 'edit' ? 'edit' : 'view');
        var content = (this.isimage ? '<img src="'+this.image+'" />' : this.text);
        var html;
        if (mode === 'view') {
            html= [
                '<div class="phlipcard">',
                '    <div class="phlipcard-front"><div class="phlipcard-word">'+this.title+'</div></div>',
                '    <div class="phlipcard-back"><div class="phlipcard-text">'+content+'</div></div>',
                '</div>'
            ].join('\n');
        } else {
            html= [
                '<div class="phlipcard">',
                '    <div class="phlipcard-front"><div class="phlipcard-dragicon" draggable="true" data-event="movecard">'+PhlipCard.icons.drag+'</div><div class="phlipcard-trashicon" data-event="removecard">'+PhlipCard.icons.trash+'</div><div class="phlipcard-word"><input type="text" value="'+this.title+'" placeholder="Word" class="phlipcard-wordinput" /></div></div>',
                '    <div class="phlipcard-back"><div class="phlipcard-text"><textarea class="phlipcard-contentinput">'+content+'</textarea></div></div>',
                '</div>'
            ].join('\n');
        }
        return html;
    }
    
    PhlipCard.prototype.getData = function(){
        var result = {
            title: this.title,
            text: this.text,
            image: this.image,
            isimage: this.isimage
        };
        return result;
    }
    
    PhlipCard.defaults = {
        title: '',
        text: '',
        image: '',
        isimage: false
    }
    
    PhlipCard.icons = {
        drag: '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="30" height="30" viewBox="0 0 30 30" class="pssicon pssicon-move pssicon-drag"><path style="stroke: none;" d="M15 2 l5 5 l-4 0 l0 7 l7 0 l0 -4 l5 5 l-5 5 l0 -4 l-7 0 l0 7 l4 0 l-5 5 l-5 -5 l4 0 l0 -7 l-7 0 l0 4 l-5 -5 l5 -5 l0 4 l7 0 l0 -7 l-4 0z"></path></svg>',
        trash: '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="30" height="30" viewBox="0 0 30 30" class="pssicon pssicon-move pssicon-drag"><path style="stroke: none;" d="M7 10 l16 0 l0 16 a3 3 0 0 1 -3 3 l-10 0 a3 3 0 0 1 -3 -3z m2.5 4 l0 11 a1 1 0 0 0 2 0 l0 -11 a1 1 0 0 0 -2 0z m4.5 0 l0 11 a1 1 0 0 0 2 0 l0 -11 a1 1 0 0 0 -2 0z m4.5 0 l0 11 a1 1 0 0 0 2 0 l0 -11 a1 1 0 0 0 -2 0z m-13.5 -5 a3 3 0 0 1 3 -3 l14 0 a3 3 0 0 1 3 3z m7 -4 a2 2 0 0 1 2 -2 l2 0 a2 2 0 0 1 2 2z"></path></svg>'
    }
    
    // jQuery-plugin
    $.fn.wordphlipper = function(options) {
        if (methods[options]){
            return methods[options].apply( this, Array.prototype.slice.call( arguments, 1));
        } else if (typeof(options) === 'object' || !options) {
            return methods.init.apply(this, arguments);
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.fn.wordphlipper' );
            return this;
        }
    };
    
    var methods = {
        init: function( options ) {
            return this.each(function(){
                var phlipper = new Phlipper(this, options);
            });
        }
    };
    
})(jQuery);