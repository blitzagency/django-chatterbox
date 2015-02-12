
class DemoCollector(object):

    def action(self, job):
        print(job.key.api)

    def post_save(self, job):
        pass

    def post_delete(self, job):
        pass
