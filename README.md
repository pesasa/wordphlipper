WordPhlipper
============

A tool for showing flippable cards. One side has short big text (one word?) and the other side
can have longer text. With this tool you can edit and show the cards.
[Demo page](http://pesasa.github.io/wordphlipper)

Properties:

*    Edit and view mode
*    You can save your set of flipcards as a file for later use and you can load your file back into the WordPhlipper.
*    The size of the cards can be scaled
*    New cards can be added (as the last card) by clicking add-button or the add-button can be dragged to whatever
     position you want it to.
*    Existing cards can be rearranged by dragging them to new positions.
*    Cards can be removed.

TODO:
*    Scaling the texts while keeping the size of card.
*    Alternatively an image on the backside instead of text.
*    Theming
*    

A jQuery-plugin. Requires jQuery and `jquery.phlipper.js`. Nothing else.

Usage
-----
HTML:
```html
<div id="place"></div>
```

Javascript:
```javascript
jQuery('#place').wordphlipper(data);
```

The `data` parameter is optional. It is in format:

```
{
    "cards": [
        {
            "title": "Word on frontside",
            "text": "Text on the backside"
        },
        ...
    ],
    "config": {
        "size": 20
    },
    "settings": {
        "mode": "edit"
    }
}
```

License
-------
MIT