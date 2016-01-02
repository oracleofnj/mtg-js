function mtgApp() {
    var pAndIChart, balance;

    function tableBody(amSched, nPeriods, extraPayments, baseMoment, loanAmount, formatter) {
        var s = '<tr><td>0</td><td>' + baseMoment.format('DD-MMM-YYYY') + '</td><td colspan=5></td><td>' + formatter(loanAmount) + '</td></tr>';
        for (i = 0; i < nPeriods; i++) {
            s = s + '<tr>' +
                    '<td>' + amSched[i].period + '</td>' +
                    '<td>' + amSched[i].paymentDate.format('DD-MMM-YYYY') + '</td>' +
                    '<td>' + (amSched[i].interestRate * 100).toFixed(3) + '%</td>' +
                    '<td>' + formatter(amSched[i].interest) + '</td>' +
                    '<td>' + formatter(amSched[i].principal) + '</td>' +
                    '<td style="background:#f0ffff">$' +
                    '<input type=number class="extra-payment" value="' +
                    extraPayments[i].toFixed(2) +
                    '" step="100" id="extra-payment-' + (i+1).toString() + '" style="width:90%;background:transparent;border:none"/>' +
                    '</td>' +
                    '<td>' + formatter(amSched[i].totalPayment) + '</td>' +
                    '<td>' + formatter(amSched[i].endingBalance) + '</td></tr>';
        }
        return s;
    }

    function updatePayment() {
        var nPeriods = $('#loan-term').val() * 12;
        var extraPayments = [];
        for (var i=0; i < nPeriods; i++) {
            extraPayments[i] = parseFloat($('#extra-payment-' + (i+1).toString()).val()) || 0;
        }
        var loanAmount = parseFloat($('#loan-amount').val());
        var baseMoment = moment($('#closing-date').val(), 'DD-MMM-YYYY');
        var formatter = d3.format('$,.02f');

        if ($('#loan-option-form input:radio[name=loan-type]:checked').val() === 'fixed') {
            var interestRate = $('#fixed-rate').val() / 100.0;
            var payment = finance.pmt(interestRate / 12, nPeriods, loanAmount);
            $('#monthly-payment').html(formatter(payment));
            amSched = finance.amortizationSchedule(interestRate, 0, nPeriods, false, loanAmount, baseMoment, extraPayments);
        } else {
            var initialRate = $('#arm-initial-rate').val() / 100.0;
            var isInterestOnly = ($('#loan-option-form input:radio[name=arm-amortization-type]:checked').val() === 'IO');
            var initialPayment = isInterestOnly ? loanAmount * initialRate / 12.0 : finance.pmt(initialRate / 12, nPeriods, loanAmount);
            var initialPeriods = $('#arm-initial-term').val() * 12;
            var fullyIndexedRate = $('#arm-fully-indexed-rate').val() / 100.0;
            var fullyIndexedPayment = finance.pmt(
                fullyIndexedRate / 12.0,
                nPeriods - initialPeriods,
                isInterestOnly ? loanAmount : finance.futureBalance(initialRate / 12.0, nPeriods, loanAmount, initialPeriods)
            );
            $('#monthly-payment').html('Initial Payment: ' + formatter(initialPayment) + '<br>Fully Indexed Payment: '+ formatter(fullyIndexedPayment));
            amSched = finance.adjustableSchedule(initialRate, fullyIndexedRate, initialPeriods, nPeriods - initialPeriods, isInterestOnly, loanAmount, baseMoment, extraPayments);
        }

        $('#amortization-schedule').html(tableBody(amSched, nPeriods, extraPayments, baseMoment, loanAmount, formatter));
        $('.extra-payment').change(updatePayment);
        pAndIChart.draw(amSched);
        balance.draw(amSched);
    }

    pAndIChart = mtgCharts.pAndIChart('p-and-i-chart');
    balance = mtgCharts.balanceChart('balance-chart');
    return {
        updatePayment: updatePayment
    };
}

$(document).ready(function() {
    var theApp = mtgApp();
    $('#loan-option-form input:radio[name=loan-type]').change(function() {
        if (this.value === 'fixed') {
            $('#fixed-rate-options').removeClass('hidden');
            $('#arm-options').addClass('hidden');
        } else {
            $('#fixed-rate-options').addClass('hidden');
            $('#arm-options').removeClass('hidden');
        }
    });
    $.fn.datepicker.defaults.autoclose = true;
    $('#loan-option-form').find('input').change(theApp.updatePayment);
    theApp.updatePayment();
});
