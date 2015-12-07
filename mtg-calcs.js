var finance = (function(){
    pmt = function(rate, nper, pv) {
        var finalFV = Math.pow(1.0 + rate, nper);
        return (rate * pv * finalFV) / (finalFV - 1.0);
    }

    nextPeriod = function(prevPeriod, extraPrincipal) {
        var period, interest, principal;
        period = prevPeriod.period + 1;
        if (prevPeriod.endingBalance > 0.005) {
            interest = prevPeriod.endingBalance * prevPeriod.interestRate / 12.0;
            principal = Math.min(prevPeriod.endingBalance, prevPeriod.monthlyPayment - interest);
        } else {
            interest = 0;
            principal = 0;
        }
        return {
            baseDate: prevPeriod.baseDate,
            monthlyPayment: prevPeriod.monthlyPayment,
            period: period,
            paymentDate: prevPeriod.baseDate.clone().add(moment.duration(period, 'months')),
            interestRate: prevPeriod.interestRate,
            interest: interest,
            principal: principal,
            requiredPayment: interest + principal,
            totalPayment: interest + principal + extraPrincipal,
            endingBalance: prevPeriod.endingBalance - principal - extraPrincipal
        };
    }

    amortizationSchedule = function(annualRate, nper, pv, firstMoment, extraPayments) {
        startPeriod = {
            baseDate: firstMoment,
            monthlyPayment: pmt(annualRate/12.0, nper, pv),
            period: 0,
            endingBalance: pv,
            interestRate: annualRate
        };
        return extraPayments.map(function(extraPrincipal) {
            return (startPeriod = nextPeriod(startPeriod, extraPrincipal))
        });
    }

    return {
        pmt : pmt,
        amortizationSchedule : amortizationSchedule
    };
})();
