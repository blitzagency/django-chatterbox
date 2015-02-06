/**
 * Datetime formatters
 * @module built.core.datetime.datetime-formats
 */
define(function(require, exports, module){

    var datetime = require('built/core/datetime/datetime');

    var months = ['January', 'February', 'March', 'April', 'May',
                  'June', 'July', 'August', 'September', 'October',
                  'November', 'December'];

    var monthsShort = [
                  'Jan', 'Feb', 'Mar', 'Apr', 'May',
                  'Jun', 'Jul', 'Aug', 'Sept', 'Oct',
                  'Nov', 'Dec'];

    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


    /**
     * format12HourTime
     *
     * @function
     * @memberOf built.core.datetime.datetime-formats
     * @param  {String} value Date String
     * @return {Date}       #TODO ADD THIS
     *
     */
    function format12HourTime(hours, minutes, ampm){
        var fmtSuffix = '',
            fmtHours,
            fmtMinutes;

        if(ampm){
            fmtSuffix = (hours >= 12) ? ' pm' : ' am';
        }

        fmtHours = hours % 12;
        fmtHours = fmtHours ? fmtHours : 12; // the hour '0' should be '12'

        fmtMinutes = minutes < 10 ? '0' + minutes : minutes;

        return fmtHours + ':' + fmtMinutes + fmtSuffix;
    }

    /**
     * daySuffix
     *
     * @function
     * @memberOf built.core.datetime.datetime-formats
     * @param  {String} value Date String
     * @return {Date}       #TODO ADD THIS
     *
     */
    function daySuffix(day){
        switch (day)
        {
            case 1:
            case 21:
            case 31:
                return 'st';
            case 2:
            case 22:
                return 'nd';
            case 3:
            case 23:
                return 'rd';
            default:
                return 'th';
        }
    }

    /**
     * monthDayYearStringForDate
     *
     * @function
     * @memberOf built.core.datetime.datetime-formats
     * @param  {String} value Date String
     * @return {Date}       #TODO ADD THIS
     *
     */
    function monthDayYearStringForDate(date){
        // August 29th 2012
        var dayValue = date.getDate();
        var suffix = daySuffix(dayValue);
        var day = dayValue.toString() + suffix;

        return months[date.getMonth()] + ' ' + day + ' ' + date.getFullYear();
    }

    /**
     * shortDayMonthTimeStringForDate
     *
     * @function
     * @memberOf built.core.datetime.datetime-formats
     * @param  {String} value Date String
     * @return {Date}       #TODO ADD THIS
     *
     */
    function shortDayMonthTimeStringForDate(date){
        // Wed 29 Aug 12:58 PM
        var dayLabel = daysShort[date.getDay()];
        var dayDate = date.getDate();
        var monthLabel = monthsShort[date.getMonth()];
        var hours = date.getHours();
        var minutes = date.getMinutes();

        var time = format12HourTime(hours, minutes, true);

        return dayLabel + ' ' + dayDate + ' ' + monthLabel + ' ' + time;
    }

    /**
     * monthDayYearStringForUTCString
     *
     * @function
     * @memberOf built.core.datetime.datetime-formats
     * @param  {String} value Date String
     * @return {Date}       #TODO ADD THIS
     *
     */
    function monthDayYearStringForUTCString(value){
        var date = datetime.UTCStringToLocalDate(value);
        return monthDayYearStringForDate(date);
    }

    /**
     * shortDayMonthTimeStringForUTCString
     *
     * @function
     * @memberOf built.core.datetime.datetime-formats
     * @param  {String} value Date String
     * @return {Date}       #TODO ADD THIS
     *
     */
    function shortDayMonthTimeStringForUTCString(value){
        var date = datetime.UTCStringToLocalDate(value);
        return shortDayMonthTimeStringForDate(date);
    }


    /**
     * relativeDate
     *
     * @function
     * @memberOf built.core.datetime.datetime-formats
     * @param  {String} value Date String
     * @return {Date}       #TODO ADD THIS
     *
     */
    function relativeDate(value){
        // compatibility for older browsers
        var now = +new Date();
        var date = datetime.UTCStringToMilliseconds(value);

        var totalSeconds = parseInt((now - date) / 1000, 10);
        var time = '';

        if (totalSeconds < 10) {
            return 'just now';

        } else if(totalSeconds < 60) {
            time = totalSeconds;
            return time + ' seconds ago';

        } else if(totalSeconds < 120) {
            return 'about a minute ago';

        } else if(totalSeconds < 3600) {
            time = parseInt(totalSeconds / 60, 10);
            return time + ' minutes ago';

        } else if(totalSeconds < 7200) {
            return 'about an hour ago';

        } else if(totalSeconds < 86400) {
            time = parseInt(totalSeconds / 3600, 10);
            return time + ' hours ago';

        } else if(totalSeconds < 172800) {
            return '1 day ago';

        } else if(totalSeconds < 604800) {
            time = parseInt(totalSeconds / 86400, 10);
            return time + ' days ago';

        } else if(totalSeconds < 1209600) {
            return '1 week ago';

        } else {
            time = parseInt(totalSeconds / 604800, 10);
            return time + ' weeks ago';
        }
    }


    // 13, 03 -> 1:03 am | pm
    exports.format12HourTime = format12HourTime;

    // 1st, 2nd, 3rd, 4th
    exports.daySuffix = daySuffix;

    // 20 seconds|minutes|hours|weeks ago
    exports.relativeDate = relativeDate;

    // August 29th 2012
    exports.monthDayYearStringForDate = monthDayYearStringForDate;
    exports.monthDayYearStringForUTCString = monthDayYearStringForUTCString;

    // Wed 29 Aug 12:58 PM
    exports.shortDayMonthTimeStringForDate = shortDayMonthTimeStringForDate;
    exports.shortDayMonthTimeStringForUTCString = shortDayMonthTimeStringForUTCString;
    exports.months = months;
    exports.monthsShort = monthsShort;
    exports.days = days;
    exports.daysShort = daysShort;

});
