<!DOCTYPE html>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<html lang="en">
<head>
<script src='https://code.jquery.com/jquery-3.2.1.min.js' ></script>
<script src='https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js' ></script>
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css">
</head>
<body class="container">
<main>
    <h1>Berlioz Hello World.js</h1>
    <h2>v3.db-polyglot</h2>
    <h4>${heading}</h4>


    <div class="row">
        <div class="col-sm">
            <div class="card purple">
                <div class="card-header">
                    Contact List
                </div>
                <div class="card-body">

                    <table class="table">
                        <thead>
                            <tr>
                                <th scope="col">Name</th>
                                <th scope="col">Phone</th>
                            </tr>
                        </thead>
                        <tbody>
                            <c:forEach items="${entries}" var="entry">
                                <tr>
                                    <th scope="row">${entry.name}</th>
                                    <td>${entry.phone}</td>
                                </tr>
                            </c:forEach>
                        </tbody>
                    </table>

                </div>
            </div>
        </div>
    </div>

</main>
</body>
</html>