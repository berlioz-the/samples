FROM python:2.7-jessie
COPY src /src
WORKDIR /src
RUN pip install -r requirements.txt
ENTRYPOINT ["python"]
CMD ["main.py"]