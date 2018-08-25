FROM python:2.7-jessie
COPY src /src
WORKDIR /src
RUN pip list
RUN pip install -r requirements.txt -U
RUN pip list
ENTRYPOINT ["python"]
CMD ["main.py"]