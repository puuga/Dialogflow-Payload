class FacebookQuickReplyItemTypeText {
    constructor (title = '', payload = '') {
        this.title = title;
        this.payload = payload;
    }

    get response () {
        return {
            content_type: 'text',
            title: this.title,
            payload: (this.payload !== '' ? this.payload : this.title)
        };
    }

    static fromSimpleStringArray (messages = []) {
        return messages.map(message => new FacebookQuickReplyItemTypeText(message));
    }

    static from2DimensionsStringArray (messages = []) {
        return messages.map(message => new FacebookQuickReplyItemTypeText(message[0], message[1]));
    }
}

class FacebookQuickReplyTypeText {
    constructor (titleMessage = '', quickReplyMessages = []) {
        this.titleMessage = titleMessage;
        this.quickReplyMessages = quickReplyMessages;
    }

    get response () {
        let quickReplies = this.quickReplyMessages.map(quickReplyItem => quickReplyItem.response);

        let response = {
            text: this.titleMessage,
            quick_replies: quickReplies
        };

        return response;
    }
}

class FacebookQuickReplyTypeUserPhoneNumber {
    constructor (titleMessage = '') {
        this.titleMessage = titleMessage;
    }

    get response () {
        const response = {
            text: this.titleMessage,
            quick_replies: [
                {
                    'content_type': 'user_phone_number'
                }
            ]
        };

        return response;
    }
}

class FacebookQuickReplyTypeUserEmail {
    constructor (titleMessage = '') {
        this.titleMessage = titleMessage;
    }

    get response () {
        const response = {
            text: this.titleMessage,
            quick_replies: [
                {
                    'content_type': 'user_email'
                }
            ]
        };

        return response;
    }
}

class FacebookGenericTemplate {
    constructor (elements, {imageAspectRatio=FacebookImageAspectRatio.HORIZONTAL}={}) {
        if (!Array.isArray(elements)) {
            throw new Error('elements must be array');
        }

        this.elements = elements;
        this.imageAspectRatio = imageAspectRatio;
    }

    get response () {
        return {
            attachment: {
                type: 'template',
                payload: {
                    template_type: 'generic',
                    image_aspect_ratio: this.imageAspectRatio,
                    elements: this.elements
                }
            }
        };
    }

    static fromMssqlPremiumPlanResult (result, config, userData) {
        let cards = result.recordset.map(data => {
            let defaultActionOption = {
                url: 'https://www.generali.co.th', 
                webviewHeightRatio: FacebookWebViewHeight.TALL, 
                messengerExtensions: true
            };
            let defaultAction = new FacebookDefaultActionItem(FacebookActionType.WEB_URL, defaultActionOption);

            let btnOption1 = {
                url: `${config.getAppUrl(userData.Item.id.S)}/web/leads-form/products?facebook_id=${userData.Item.id.S}`, 
                webviewHeightRatio: FacebookWebViewHeight.TALL, 
                messengerExtensions: true
            };
            let btn1 = new FacebookButtonItem(FacebookActionType.WEB_URL, 'สนใจแผนนี้', btnOption1);
    
            let btnOption2 = {
                url: `${config.s3_base_url}/compare-plan-images/GENHealthLumpSumCompare.png`, 
                webviewHeightRatio: FacebookWebViewHeight.TALL, 
                messengerExtensions: true
            };
            let btn2 = new FacebookButtonItem(FacebookActionType.WEB_URL, 'เปรียบเทียบแผน', btnOption2);
    
            let btnOption3 = {
                payload: 'PremiumCal.Health.F1.Recal'
            };
            let btn3 = new FacebookButtonItem(FacebookActionType.POSTBACK, 'ยังไม่ถูกใจ', btnOption3);
    
            let buttons = [
                btn1.response,
                btn2.response,
                btn3.response
            ];
    
            let element = new FacebookGenericTemplateElement(
                data.Header, 
                `${config.s3_base_url}/plan-images/images/exported/${data.imageName}.png`, 
                `${data.productName} ${data.productPlan}`, 
                defaultAction.response, 
                buttons);
            
            return element.response;
        });
    
        // console.log(JSON.stringify(new FacebookGenericTemplate(cards, {imageAspectRatio:FacebookImageAspectRatio.SQUARE}).response));
    
        return new FacebookGenericTemplate(cards, {imageAspectRatio: FacebookImageAspectRatio.SQUARE});
    }
}

class FacebookGenericTemplateElement {
    constructor (title = '', imageUrl = '', subtitle = '', defaultAction = {}, buttons = []) {
        if (title === '') {
            throw new Error('title can NOT be empty');
        }
        if (imageUrl === '') {
            throw new Error('imageUrl can NOT be empty');
        }
        if (subtitle === '') {
            throw new Error('subtitle can NOT be empty');
        }
        if (typeof defaultAction !== 'object') {
            throw new Error('title can NOT be empty');
        }
        if (!Array.isArray(buttons)) {
            throw new Error('buttons must be array');
        }

        this.title = title;
        this.imageUrl = imageUrl;
        this.subtitle = subtitle;
        this.defaultAction = defaultAction;
        this.buttons = buttons;
    }

    get response () {
        return {
            title: this.title,
            image_url: this.imageUrl,
            subtitle: this.subtitle,
            default_action: this.defaultAction,
            buttons: this.buttons
        };
    }
}

class FacebookDefaultActionItem {
    constructor (type, {url='', webviewHeightRatio=FacebookWebViewHeight.TALL, messengerExtensions=false, payload=''}={}) {
        if (!type || (typeof type !== 'string')) {
            throw new Error('type can NOT be empty');
        }

        this.type = type;
        this.url = url;
        this.webviewHeightRatio = webviewHeightRatio;
        this.messengerExtensions = messengerExtensions;
        this.payload = payload;
    }

    get response () {
        switch (this.type) {
        case FacebookActionType.POSTBACK:
            return {
                type: 'postback',
                payload: this.payload
            };
        
        case FacebookActionType.WEB_URL:
            return {
                type: 'web_url',
                url: this.url,
                webview_height_ratio: this.webviewHeightRatio,
                messenger_extensions: this.messengerExtensions,  
            };
        default:
            throw new Error('Button is error');
        }
    }
}

class FacebookButtonTemplate {
    constructor (text, buttons) {
        if (!text || (typeof text !== 'string')) {
            throw new Error('type can NOT be empty');
        }
        if (!Array.isArray(buttons)) {
            throw new Error('elements must be array');
        }

        this.text = text;
        this.buttons = buttons;
    }

    get response () {
        return {
            attachment: {
                type: 'template',
                payload: {
                    template_type: 'button',
                    text: this.text,
                    buttons: this.buttons
                }
            }
        };
    }
}

class FacebookListTemplate {
    constructor (topElementStyle, elements, buttons) {
        if (!Array.isArray(elements)) {
            throw new Error('elements must be array');
        }
        if (!Array.isArray(buttons)) {
            throw new Error('buttons must be array');
        }

        this.topElementStyle = topElementStyle;
        this.elements = elements;
        this.buttons = buttons;
    }

    get response () {
        const response = {
            attachment: {
                type: 'template',
                payload: {
                    template_type: 'list',
                    top_element_style: this.topElementStyle,
                    elements: []
                }
            }
        };

        for (const element of this.elements) {
            response.attachment.payload.elements.push(element);
        }

        if (this.buttons.length == 1) {
            response.attachment.buttons = this.buttons[0];
        }

        return response;
    }
}

class FacebookButtonItem {
    constructor (
        type, 
        title, 
        {
            url = '', 
            webviewHeightRatio = FacebookWebViewHeight.TALL, 
            messengerExtensions = false, 
            payload = ''
        } = {}
    ) {
        if (!type || (typeof type !== 'string')) {
            throw new Error('type can NOT be empty');
        }
        if (!title || (typeof title !== 'string')) {
            throw new Error('title can NOT be empty');
        }

        this.type = type;
        this.title = title;
        this.url = url;
        this.webviewHeightRatio = webviewHeightRatio;
        this.messengerExtensions = messengerExtensions;
        this.payload = payload;
    }

    get response () {
        switch (this.type) {
        case FacebookActionType.POSTBACK:
            return {
                type: 'postback',
                title: this.title,
                payload: this.payload
            };
        
        case FacebookActionType.WEB_URL:
            return {
                type: 'web_url',
                url: this.url,
                title: this.title,
                webview_height_ratio: this.webviewHeightRatio,
                messenger_extensions: this.messengerExtensions,  
            };

        case FacebookActionType.PHONE_NUMBER:
            return {
                type: 'phone_number',
                title: this.title,
                payload: this.payload
            };

        default:
            throw new Error('Button is error');
        }
    }
}

class FacebookElementItem {
    constructor (title, subtitle, imageUrl = '', buttons = [], defaultAction = {}) {
        if (!title || (typeof title !== 'string')) {
            throw new Error('title can NOT be empty');
        }
        if (!subtitle || (typeof subtitle !== 'string')) {
            throw new Error('subtitle can NOT be empty');
        }
        if (typeof imageUrl !== 'string') {
            throw new Error('imageUrl can NOT be empty');
        }

        this.title = title;
        this.subtitle = subtitle;
        this.imageUrl = imageUrl;
        this.buttons = buttons;
        this.defaultAction = defaultAction;
    }

    get response () {
        const response = {
            title: this.title,
            subtitle: this.subtitle
        };

        if (this.imageUrl !== '') {
            response.image_url = this.imageUrl;
        }

        if (this.buttons.length > 0) {
            response.buttons = [];

            for (const button of this.buttons) {
                response.buttons.push(button);
            }
        }

        // ECMA 5+
        if (!(Object.keys(this.defaultAction).length === 0 && this.defaultAction.constructor === Object)) {
            response.default_action = this.defaultAction;
        }

        return response;
    }
}

const FacebookActionType = {
    WEB_URL: 'url',
    POSTBACK: 'postback',
    PHONE_NUMBER: 'phone_number'
};

const FacebookWebViewHeight = {
    COMPACT: 'compact',
    TALL: 'tall',
    FULL: 'full'
};

const FacebookImageAspectRatio = {
    HORIZONTAL: 'horizontal', // 1.91:1
    SQUARE: 'square' // 1:1
};

const FacebookTopElementStyle = {
    LARGE: 'large',
    COMPACT: 'compact',
};

module.exports = {
    FacebookQuickReplyTypeText,
    FacebookQuickReplyItemTypeText,
    FacebookQuickReplyTypeUserPhoneNumber,
    FacebookQuickReplyTypeUserEmail,
    FacebookButtonItem,
    FacebookDefaultActionItem,
    FacebookActionType,
    FacebookWebViewHeight,
    FacebookImageAspectRatio,
    FacebookGenericTemplate,
    FacebookGenericTemplateElement,
    FacebookButtonTemplate,
    FacebookTopElementStyle,
    FacebookListTemplate,
    FacebookElementItem
};