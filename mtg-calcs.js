var finance = (function(){
    pmt = function(rate, nper, pv) {
        accrualFactor = 1.0 + rate;
        finalFV = Math.pow(accrualFactor, nper);
        return (rate * pv * finalFV) / (finalFV - 1.0);
    }

    return {
        pmt : pmt
    };
})();
