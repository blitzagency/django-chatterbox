/**
 * Calender helpers
 * @module built.core.calendar.calendar
 */
define(function(require, exports, module){

    function _isDate(obj){
        // taken directly from underscore.js to avoid the _ dependency.
        // perhaps this should be moved to datetime?
        return Object.prototype.toString.call(obj) == '[object Date]';
    }

    /**
     * used to get the first day of the month for a date
     *
     * Example :ref:`example.calendar.firstOfMonth`
     *
     * @function
     * @memberOf built.core.calendar.calendar
     * @param  {Date|Number} [year]  any date
     * @param  {Number} [month] Date object
     * @return {Date}       the first day of the month passed in
     *
     */
    function firstOfMonth(year, month){

        if(_isDate(year)){
            return new Date(year.getFullYear(), year.getMonth(), 1);
        }

        if (!year && !month){
            var now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
        } else {

            // javascript months are 0 based, 0 would be January
            // the interface here expects 1 for January.
            month = month - 1;
        }

        return new Date(year, month, 1);
    }

    /**
     * get the previous month for given year and month
     *
     * Example :ref:`example.calendar.previousMonthForYearMonth`
     *
     * @function
     * @memberOf built.core.calendar.calendar
     * @param  {Date} year  any date
     * @param  {Date} month Date object
     * @return {Date}       previous month
     *
     */
    function previousMonthForYearMonth(year, month){
        var date = new Date(year, (month - 1), 1);
        return previousMonthForDate(date);
    }

    /**
     * get the next month for given year and month
     *
     * Example :ref:`example.calendar.nextMonthForYearMonth`
     *
     * @function
     * @memberOf built.core.calendar.calendar
     * @param  {Number} year  Year
     * @param  {Number} month Month
     * @return {Date}       next month
     *
     */
    function nextMonthForYearMonth(year, month){
        var date = new Date(year, (month - 1), 1);
        return nextMonthForDate(date);
    }

    /**
     * get the previous month for given date
     *
     * Example :ref:`example.calendar.previousMonthForDate`
     *
     * @function
     * @memberOf built.core.calendar.calendar
     * @param  {Date} [date]  any date
     * @return {Date}       previous month
     *
     */
    function previousMonthForDate(date){
        // day zero represents the last day of the previous month
        return new Date(date.getFullYear(), date.getMonth(), 0);
    }

    /**
     * get the next month for given date
     *
     * Example :ref:`example.calendar.nextMonthForDate`
     *
     * @function
     * @memberOf built.core.calendar.calendar
     * @param  {Date} [date]  any date
     * @return {Date}       next month
     *
     */
    function nextMonthForDate(date){

        if(date.getDate() != 1){
            date = new Date(date.getFullYear(), date.getMonth(), 1);
        }

        var startTZ = date.getTimezoneOffset();
        var endTZ;

        var days = daysInJavaScriptMonth(date.getFullYear(), date.getMonth());
        result  = new Date(date.getTime() + ((86400 * (days)) * 1000));

        endTZ = result.getTimezoneOffset();
        var tzShift = (endTZ - startTZ) * 60 * 1000;

        return new Date(result.getTime() + tzShift);
    }


    /**
     * returns a 0 based index version of the month
     *
     * Example :ref:`example.calendar.daysInJavaScriptMonth`
     *
     * * .. note ::
     *
     *     JS is 0 based months, 0 = January
     *     passing 0 for the day in the below is syaing
     *     give me the last day of the previous month.
     *     So we need to add 1 to our month, so that
     *     "last month", is effectively the request month.
     *
     * @function
     * @memberOf built.core.calendar.calendar
     * @param  {Number} year  any date
     * @param  {Number} month  any date
     * @return {Date}       next month
     *
     */
    function daysInJavaScriptMonth(year, month){


        if (!year && !month){
            var now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
        }

        month = month + 1;

        var d = new Date(year, month, 0);
        return d.getDate();
    }

    /**
     * gets you the number of days in a given month
     *
     * Example :ref:`example.calendar.calendarMonthDays`
     *
     * @function
     * @memberOf built.core.calendar.calendar
     * @param  {Number} year  desired year
     * @param  {Number} month  desired month
     * @param  {Object} options  { firstDayOfWeek: Number, useDates: Boolean}
     * @return {Date}       next month
     *
     */

    function calendarMonthDays(year, month, options){
        options = options || {};
        var firstDayOfWeek = options.firstDayOfWeek || 0;
        var useDates = options.useDates || false;

        var date = _isDate(year) ? year : firstOfMonth(year, month);
        var days = daysInJavaScriptMonth(date.getFullYear(), date.getMonth());

        if(date.getDate() != 1){
            date = new Date(date.getFullYear(), date.getMonth(), 1);
        }

        var first = date.getDay();
        // var weekdaysCount = date.getDay() - firstDayOfWeek;
        // if (weekdaysCount == -1) weekdaysCount = 6;

        var result = [];

        // push in undefined's to represent where the month
        // should start.
        // for(var i = 0; i < weekdaysCount; i++){
        //     result.push(undefined);
        // }

        year = date.getFullYear();
        month = date.getMonth();

        for(i = 1; i <= days; i++) {
            result.push(useDates ? new Date(year, month, i) : i);
        }

        return result;
    }

    /**
     * get a buffered (42 days (6 weeks * 7 days)) array of date objects
     * for any given year and month
     *
     * Example :ref:`example.calendar.bufferedCalendarMonthDays`
     *
     * .. note ::
     *     Returns a 42 (7x6) item array representing the last
     *     days of the previous month, the days of the desired month
     *     and the first days of the next month.
     *
     *     This is intended to be used to build a 7x6 block calendar
     *     representation. If you just want the days for the current month,
     *     omitting the prefix and duffix days, use calendarMonthDays()
     *
     * @function
     * @memberOf built.core.calendar.calendar
     * @param  {Number} year  desired year
     * @param  {Number} month  desired month
     * @param  {Object} options  { firstDayOfWeek: Number, useDates: Boolean}
     * @return {Date}       next month
     *
     */

    function bufferedCalendarMonthDays(year, month, options){
        options = options || {};
        options.firstDayOfWeek = options.firstDayOfWeek || 0;
        options.useDates = options.useDates || false;

        if(options.prefixDays === undefined){
            options.prefixDays = true;
        }

        if(options.suffixDays === undefined){
            options.suffixDays = true;
        }

        var firstDayOfWeek = options.firstDayOfWeek;
        var useDates = options.useDates;
        var date = _isDate(year) ? year : firstOfMonth(year, month);

        if(date.getDate() != 1){
            date = new Date(date.getFullYear(), date.getMonth(), 1);
        }

        var weekdaysCount = date.getDay() - firstDayOfWeek;

        if (weekdaysCount == -1) weekdaysCount = 6;

        var lastMonth = previousMonthForDate(date);
        var nextMonth = nextMonthForDate(date);

        var results = [];
        var week = [];
        var value;

        // days last month
        for(var i = 0; i < weekdaysCount; i++) {
            var day = lastMonth.getDate() - (weekdaysCount - i) + 1;
            var d = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), day);
            value = useDates ? d : d.getDate();
            results.push(options.prefixDays ? value : undefined);
        }

        results = results.concat(calendarMonthDays(date, null, options));

        // days next month to round us off to 6 weeks
        var nextMonthYear = nextMonth.getFullYear();
        var nextMonthMonth = nextMonth.getMonth();
        var nextMonthDay = 1;

        while(results.length < 42){
            value = useDates ? new Date(nextMonthYear, nextMonthMonth, nextMonthDay) : nextMonthDay;
            results.push(options.suffixDays ? value : undefined);
            nextMonthDay++;
        }

        return results;
    }


    /**
     * returns back an array of arrays for a given year/month with all
     * of the dates populated in each slot.  used for building calendars
     *
     * Example :ref:`example.calendar.bufferedCalendarMonthWeeks`
     *
     *
     * @function
     * @memberOf built.core.calendar.calendar
     * @param  {Number} year  desired year
     * @param  {Number} month  desired month
     * @param  {Object} options  { firstDayOfWeek: Number, useDates: Boolean}
     * @return {Date}       next month
     *
     */

    function bufferedCalendarMonthWeeks(year, month, options){
        var days = bufferedCalendarMonthDays(year, month, options);
        return _splitDaysToWeeks(days);
    }

    function _splitDaysToWeeks(days, result){
        result = result || [];

        while (days.length){
            result.push(days.splice(0, 7));
        }

        return result;
    }

    exports.daysInJavaScriptMonth = daysInJavaScriptMonth;
    exports.calendarMonthDays = calendarMonthDays;
    exports.bufferedCalendarMonthDays = bufferedCalendarMonthDays;
    exports.bufferedCalendarMonthWeeks = bufferedCalendarMonthWeeks;
    exports.previousMonthForYearMonth = previousMonthForYearMonth;
    exports.previousMonthForDate = previousMonthForDate;
    exports.nextMonthForYearMonth = nextMonthForYearMonth;
    exports.nextMonthForDate = nextMonthForDate;
    exports.firstOfMonth = firstOfMonth;
});
