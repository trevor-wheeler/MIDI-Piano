from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    pass

class Preset(models.Model):
    name = models.CharField(max_length=69)
    dateCreated = models.DateTimeField(auto_now_add=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='createdPresets')
    owners = models.ManyToManyField(User, blank=True, related_name='prests')
    likes = models.ManyToManyField(User, blank=True, related_name='likedPresets')
    downloads = models.IntegerField(default=0)
    knobValues = models.JSONField()

    def __str__(self):
        return f"{self.name} | {self.creator}"