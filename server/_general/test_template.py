import unittest, cProfile
from mockito import mock, when, unstub

class TemplateTestCase(unittest.TestCase):

    def test_dummy(self):
        self.assertTrue(True)

#python3 -m unittest -vf _general.test_template
if __name__ == '__main__':
    #cProfile.run('unittest.main()')
    unittest.main()
    pass
