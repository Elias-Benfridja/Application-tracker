from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Document(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField()
    details = models.TextField()

class Application(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    country = models.CharField(max_length=50)
    purpose = models.CharField(max_length=50)
    deadline = models.DateField()
    documents = models.ManyToManyField(Document, through='ApplicationDocumentation')

class ApplicationDocumentation(models.Model):
    class Status(models.TextChoices):
        TO_DO  = 'T', 'To do'
        PENDING = 'P', 'Pending'
        DONE = 'D', 'Done'
    document = models.ForeignKey(Document, on_delete=models.CASCADE)
    application = models.ForeignKey(Application, on_delete=models.CASCADE)
    status = models.CharField(choices=Status.choices, max_length=1, default=Status.TO_DO)
    
