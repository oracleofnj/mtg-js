var finance = (function(){
    var pmt = function(rate, nper, pv) {
        if (Math.abs(rate) <= 1e-6) {
            return pv / nper;
        } else {
            var finalFV = Math.pow(1.0 + rate, nper);
            return (rate * pv * finalFV) / (finalFV - 1.0);
        }
    }

    var futureBalance = function(rate, nper, pv, period) {
        if (Math.abs(rate) <= 1e-6) {
            return pv * period / nper;
        } else {
            var finalFV = Math.pow(1.0 + rate, nper);
            var interimFV = Math.pow(1.0 + rate, period);
            return pv * (interimFV - (interimFV - 1) * finalFV / (finalFV - 1.0));
        }
    }

    var nextPeriod = function(prevPeriod, extraPrincipal) {
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

    var amortizationSchedule = function(annualRate, firstPeriod, nper, isInterestOnly, pv, firstMoment, extraPayments) {
        startPeriod = {
            baseDate: firstMoment,
            monthlyPayment: isInterestOnly ? pv * annualRate / 12.0 : pmt(annualRate/12.0, nper, pv),
            period: firstPeriod,
            endingBalance: pv,
            interestRate: annualRate
        };
        return extraPayments.map(function(extraPrincipal) {
            return (startPeriod = nextPeriod(startPeriod, extraPrincipal));
        });
    }

    var adjustableSchedule = function(initialRate, fullyIndexedRate, initialPeriods, fullyIndexedPeriods, isInterestOnly, pv, firstMoment, extraPayments) {
        schedule = amortizationSchedule(
            initialRate,
            0,
            initialPeriods + fullyIndexedPeriods,
            isInterestOnly,
            pv,
            firstMoment,
            extraPayments.slice(0, initialPeriods)
        );
        for (var i=0; i < fullyIndexedPeriods / 12.0; i++) {
            schedule = schedule.concat(amortizationSchedule(
                fullyIndexedRate,
                i * 12 + initialPeriods,
                fullyIndexedPeriods - i * 12,
                false,
                schedule[schedule.length - 1].endingBalance,
                firstMoment,
                extraPayments.slice(initialPeriods + i*12, initialPeriods + i*12 + 12)
            ));
        }
        return schedule;
    }

    return {
        pmt : pmt,
        futureBalance : futureBalance,
        amortizationSchedule : amortizationSchedule,
        adjustableSchedule : adjustableSchedule
    };
})();
