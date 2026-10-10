from flask import Flask, render_template, request
import mysql.connector

app = Flask(__name__)

# MYSQL CONNECTION
db = mysql.connector.connect(
    host="127.0.0.1",
    port=3306,
    user="root",
    password="reddy",
    database="insititutefinder_verification"
)

# IMPORTANT
cursor = db.cursor(dictionary=True)

# HOME PAGE
@app.route("/", methods=["GET", "POST"])
def home():

    institutes = []
    message = ""

    if request.method == "POST":

        student_name = request.form["student_name"]
        course_name = request.form["course_name"]
        graduation_year = request.form["graduation_year"]

        # INSERT STUDENT DATA
        cursor.execute("""
            INSERT INTO student
            (student_name, course_name, graduation_year)

            VALUES (%s,%s,%s)
        """, (student_name, course_name, graduation_year))

        db.commit()

        # FETCH VALID INSTITUTES
        cursor.execute("""

            SELECT *

            FROM institute

            WHERE course_name=%s
            AND license_status='Valid'

        """, (course_name,))

        institutes = cursor.fetchall()

        # NO RESULT MESSAGE
        if len(institutes) == 0:
            message = "This course is not available in suitable licensed institutes"

    return render_template(
        "index.html",
        institutes=institutes,
        message=message
    )

# INSTITUTE DETAILS PAGE
@app.route("/institute/<int:id>")
def institute_details(id):

    query = """

    SELECT institute.*,
           license.license_number,
           license.expiry_date,
           verification.verification_status,
           verification.verified_date

    FROM institute

    LEFT JOIN license
    ON institute.institute_id = license.institute_id

    LEFT JOIN verification
    ON institute.institute_id = verification.institute_id

    WHERE institute.institute_id = %s

    """

    cursor.execute(query, (id,))

    institute = cursor.fetchone()

    return render_template(
        "details.html",
        institute=institute
    )

if __name__ == "__main__":
    app.run(debug=True)