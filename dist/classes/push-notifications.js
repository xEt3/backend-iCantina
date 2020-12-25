"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PushNotification {
    static sendNotificationToUser(title, messages, userID) {
        const data = {
            app_id: "6d199a80-94a9-4b03-a8b8-1c7005f5ab2e",
            contents: { "en": messages },
            headings: { "en": title },
            filters: [
                { "field": "tag", "key": "user_id_db", "relation": "=", "value": userID }
            ]
        };
        this.sendNotification(data);
    }
    ;
    static sendNotificationToAllEmployees(title, messages) {
        const data = {
            app_id: "6d199a80-94a9-4b03-a8b8-1c7005f5ab2e",
            contents: { "en": messages },
            headings: { "en": title },
            filters: [
                { "field": "tag", "key": "user_type", "relation": "=", "value": 'employee' }
            ]
        };
        this.sendNotification(data);
    }
    ;
    static sendNotificationToAllUsers(title, messages) {
        const data = {
            app_id: "6d199a80-94a9-4b03-a8b8-1c7005f5ab2e",
            contents: { "en": messages },
            headings: { "en": title },
            included_segments: ["Active Users", "Inactive Users"],
        };
        this.sendNotification(data);
    }
    ;
    static sendNotification(data) {
        var headers = {
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": "Basic " + this.token
        };
        var options = {
            host: "onesignal.com",
            port: 443,
            path: "/api/v1/notifications",
            method: "POST",
            headers: headers
        };
        var https = require('https');
        var req = https.request(options, (res) => {
            res.on('data', function (data) {
            });
        });
        req.on('error', (e) => {
        });
        req.write(JSON.stringify(data));
        req.end();
    }
    ;
}
exports.default = PushNotification;
PushNotification.token = 'ZTM3YTFkZWItOTUzOS00Yzg5LTkzMDQtMWZjYWU5YTJlZjMz';
