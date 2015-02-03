class MasterSlaveRouter(object):
    def db_for_read(self, model, **hints):
        return 'slave'

    def db_for_write(self, model, **hints):
        return 'default'

    def allow_relation(self, obj1, obj2, **hints):
        db_list = ('default', 'slave')
        if obj1.state.db in db_list and obj2.state.db in db_list:
            return True
        return None

    def allow_syncdb(self, db, model):
        return True