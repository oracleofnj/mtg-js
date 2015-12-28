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
        var interestRate = $('#interest-rate').val() / 100.0;
        var loanAmount = parseFloat($('#loan-amount').val());
        var payment = finance.pmt(interestRate / 12, nPeriods, loanAmount);
        var baseMoment = moment($('#closing-date').val(), 'DD-MMM-YYYY');
        var extraPayments = [];
        for (var i=0; i < nPeriods; i++) {
            extraPayments[i] = parseFloat($('#extra-payment-' + (i+1).toString()).val()) || 0;
        }
        var formatter = d3.format('$,.02f');

        $('#monthly-payment').html(formatter(payment));
        amSched = finance.amortizationSchedule(interestRate, nPeriods, loanAmount, baseMoment, extraPayments);
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
    $('#loan-option-form').find('input').change(theApp.updatePayment);
    theApp.updatePayment();
});
