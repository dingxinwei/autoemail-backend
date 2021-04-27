module.exports = {
  email: {
    createEmail: 'insert into t_email (from_email,to_email,email_subject,email_content,send_date,form_email_password,id,email_status) values (?,?,?,?,?,?,?,?)',
    updateEmailStatus: 'update t_email set email_status=? where id=?',
    selectTodayEmail: 'select * from t_email where TO_DAYS(send_date) = TO_DAYS(?) order by send_date',
  },
};
