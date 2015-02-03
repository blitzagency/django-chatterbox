/**
 * Datetime formatters
 *
 * .. note::
 *     All values assumed to be ISO 8601 and in UTC
 *
 *     |  2013-08-29T14:29Z
 *     |  2013-08-29T14:29.000Z
 *     |  2013-08-29T14:29+0000
 *     |  2013-08-29T14:29:30.123+0000
 *
 * @module built.core.datetime.datetime
 */
define(function(require, exports, module){


    var isoRegex = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?:\:(\d{2})(?:\.(\d+))?)?(?:Z|\+0000)?/;

    /**
     * format12HourTime
     *
     * @function
     * @memberOf built.core.datetime.datetime
     * @param  {String} value ISO 8601 DateTime String (UTC)
     * @return {Number}       #TODO ADD THIS
     *
     */
    function UTCStringToMilliseconds(value){
        // 2013-08-29T15:02:00Z
        // milliseconds and seconds are optional
        // if omitted, 0's are assumed.
        var c = isoRegex.exec(value);
        var year, month, day, hours, minutes, seconds, millisecond = 0;
        year = c[1];
        month = (c[2] - 1);
        day = c[3];
        hour = c[4];
        minute = c[5];
        second = c[6] || 0;
        millisecond = c[7] || 0;

        return Date.UTC(year, month, day, hour, minute, second, millisecond);
    }

    /**
     * format12HourTime
     *
     * @function
     * @memberOf built.core.datetime.datetime
     * @param  {String} value ISO 8601 DateTime String (UTC)
     * @return {Number}       #TODO ADD THIS
     *
     */
    function UTCStringToSeconds(value){
        var utcMilliSeconds = UTCStringToMilliseconds(value);
        return parseInt((utcMilliSeconds / 1000), 10);
    }

    /**
     * format12HourTime
     *
     * @function
     * @memberOf built.core.datetime.datetime
     * @param  {String} value ISO 8601 DateTime String (UTC)
     * @return {Date}       #TODO ADD THIS
     *
     */
    function UTCStringToLocalDate(value){
        var utcSeconds = UTCStringToMilliseconds(value);

        var date = new Date(0);
        date.setTime(utcSeconds);

        return date;
    }

    exports.UTCStringToMilliseconds = UTCStringToMilliseconds;
    exports.UTCStringToSeconds = UTCStringToSeconds;
    exports.UTCStringToLocalDate = UTCStringToLocalDate;
});
