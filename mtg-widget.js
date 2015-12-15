function tableBody(amSched, nPeriods, extraPayments, baseMoment, loanAmount) {
    var s = '<tr><td>0</td><td>' + baseMoment.format('DD-MMM-YYYY') + '</td><td colspan=5></td><td>$' + loanAmount.toFixed(2) + '</td></tr>';
    for (i = 0; i < nPeriods; i++) {
        s = s + '<tr>' +
                '<td>' + amSched[i].period + '</td>' +
                '<td>' + amSched[i].paymentDate.format('DD-MMM-YYYY') + '</td>' +
                '<td>' + (amSched[i].interestRate * 100).toFixed(3) + '%</td>' +
                '<td>$' + amSched[i].interest.toFixed(2) + '</td>' +
                '<td>$' + amSched[i].principal.toFixed(2) + '</td>' +
                '<td style="background:#f0ffff">$' +
                '<input type=number class="extra-payment" value="' +
                extraPayments[i].toFixed(2) +
                '" step="100" id="extra-payment-' + (i+1).toString() + '" style="width:90%;background:transparent;border:none"/>' +
                '</td>' +
                '<td>$' + amSched[i].totalPayment.toFixed(2) + '</td>' +
                '<td>$' + amSched[i].endingBalance.toFixed(2) + '</td></tr>';
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

    $('#monthly-payment').html('$' + payment.toFixed(2));
    amSched = finance.amortizationSchedule(interestRate, nPeriods, loanAmount, baseMoment, extraPayments);
    $('#amortization-schedule').html(tableBody(amSched, nPeriods, extraPayments, baseMoment, loanAmount));
    $('.extra-payment').change(updatePayment);
    pAndIChart.draw(amSched);
}

var pAndIChart;

$(document).ready(function() {
    pAndIChart = mtgChart('p-and-i-chart');
    $('#loan-option-form').find('input').change(updatePayment);
    updatePayment();
});
