function updatePayment() {
    var payment = finance.pmt(
        $('#interest_rate').val() / 1200.0,
        $('#loan_term').val() * 12,
        parseFloat($('#loan_amount').val())
    );

    $('#monthly_payment').html('$' + payment.toFixed(2));
}

$(document).ready(function() {
    $('#loan_amount').change(updatePayment);
    $('#interest_rate').change(updatePayment);
    $('#loan_term').change(updatePayment);
    updatePayment();
});
