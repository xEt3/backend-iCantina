export default class PushNotification {

    static token: string = 'ZTM3YTFkZWItOTUzOS00Yzg5LTkzMDQtMWZjYWU5YTJlZjMz'

    public static sendNotificationToUser(title:string,messages: string, userID: string) {
        const data = {
            app_id: "6d199a80-94a9-4b03-a8b8-1c7005f5ab2e",
            contents: { "en": messages },
            headings:{"en":title},
            filters: [
                { "field": "tag", "key": "user_id_db", "relation": "=", "value": userID }
            ]
        };
        this.sendNotification(data);
    };

    public static sendNotificationToAllEmployees(title:string,messages: string) {
        const data = {
            app_id: "6d199a80-94a9-4b03-a8b8-1c7005f5ab2e",
            contents: { "en": messages },
            headings:{"en":title},
            filters: [
                { "field": "tag", "key": "user_type", "relation": "=", "value": 'employee' }
            ]
        };
        this.sendNotification(data);
    };

    public static sendNotificationToAllUsers(title:string,messages: string) {
        const data = {
            app_id: "6d199a80-94a9-4b03-a8b8-1c7005f5ab2e",
            contents: { "en": messages },
            headings:{"en":title},
            included_segments:["Active Users", "Inactive Users"],
        };
        this.sendNotification(data);
    };

    private static  sendNotification(data: any) {
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

        var req = https.request(options, (res: any) => {
            res.on('data', function (data: string) {
                console.log("Response:");
                console.log(JSON.parse(data));
            });
        });
        req.on('error', (e: any) => {
            console.log("ERROR:");
            console.log(e);
        });
        req.write(JSON.stringify(data));
        req.end();
    };

}