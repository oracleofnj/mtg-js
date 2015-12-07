function updatePayment() {
    var nPeriods = $('#loan-term').val() * 12;
    var interestRate = $('#interest-rate').val() / 100.0;
    var loanAmount = parseFloat($('#loan-amount').val());
    var payment = finance.pmt(interestRate / 12, nPeriods, loanAmount);
    var baseMoment = moment($('#closing-date').val(), 'DD-MMM-YYYY');
    var extraPayments = [];
    for (var i=0; i < nPeriods; i++) {
        extraPayments[i] = 0;
    }

    amSched = finance.amortizationSchedule(interestRate, nPeriods, loanAmount, baseMoment, extraPayments);
    var s = '<tr><td>0</td><td>' + baseMoment.format('DD-MMM-YYYY') + '</td><td colspan=6></td><td>$' + loanAmount.toFixed(2) + '</td></tr>';
    $('#monthly-payment').html('$' + payment.toFixed(2));
    for (i = 0; i < nPeriods; i++) {
        s = s + '<tr><td>' +
                amSched[i].period + '</td><td>' +
                amSched[i].paymentDate.format('DD-MMM-YYYY') + '</td><td>' +
                (amSched[i].interestRate * 100).toFixed(3) + '%</td><td>' +
                '$' + amSched[i].interest.toFixed(2) + '</td><td>' +
                '$' + amSched[i].principal.toFixed(2) + '</td><td>' +
                '$' + amSched[i].requiredPayment.toFixed(2) + '</td><td>' +
                '$' + extraPayments[i].toFixed(2) + '</td><td>' +
                '$' + amSched[i].totalPayment.toFixed(2) + '</td><td>' +
                '$' + amSched[i].endingBalance.toFixed(2) + '</td></tr>';
    }
    $('#amortization-schedule').html(s);
}

$(document).ready(function() {
    $('#loan-option-form').find("input").change(updatePayment);
    updatePayment();
});
